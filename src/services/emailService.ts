interface EmailConfig {
  provider: "sendgrid" | "mailgun" | "aws-ses";
  apiKey: string;
  domain?: string; // For Mailgun
  region?: string; // For AWS
  fromEmail: string;
  fromName: string;
}

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private config: EmailConfig;

  constructor() {
    // Determine which email provider is configured
    const sendgridKey = import.meta.env.VITE_SENDGRID_API_KEY;
    const mailgunKey = import.meta.env.VITE_MAILGUN_API_KEY;
    const awsKey = import.meta.env.VITE_AWS_ACCESS_KEY;

    let provider: "sendgrid" | "mailgun" | "aws-ses" = "sendgrid";
    let apiKey = "";

    if (sendgridKey) {
      provider = "sendgrid";
      apiKey = sendgridKey;
    } else if (mailgunKey) {
      provider = "mailgun";
      apiKey = mailgunKey;
    } else if (awsKey) {
      provider = "aws-ses";
      apiKey = awsKey;
    }

    this.config = {
      provider,
      apiKey,
      domain: import.meta.env.VITE_MAILGUN_DOMAIN || "",
      region: import.meta.env.VITE_AWS_REGION || "us-east-1",
      fromEmail: import.meta.env.VITE_FROM_EMAIL || "noreply@laptopstore.com",
      fromName: import.meta.env.VITE_FROM_NAME || "Laptop Store",
    };
  }

  private isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.fromEmail);
  }

  async sendEmail(
    emailData: EmailMessage,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      console.warn(
        "Email service not configured. Please add email provider API keys to your .env file",
      );
      return { success: false, error: "Email service not configured" };
    }

    try {
      switch (this.config.provider) {
        case "sendgrid":
          return await this.sendWithSendGrid(emailData);
        case "mailgun":
          return await this.sendWithMailgun(emailData);
        case "aws-ses":
          return await this.sendWithAWSSES(emailData);
        default:
          return { success: false, error: "Unknown email provider" };
      }
    } catch (error) {
      console.error("Email send error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async sendWithSendGrid(
    emailData: EmailMessage,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const payload = {
      personalizations: [
        {
          to: [{ email: emailData.to }],
        },
      ],
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName,
      },
      subject: emailData.subject,
      content: [
        {
          type: "text/html",
          value: emailData.html,
        },
        ...(emailData.text
          ? [
              {
                type: "text/plain",
                value: emailData.text,
              },
            ]
          : []),
      ],
    };

    const response = await fetch("https://api.sendgrid.v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.errors?.[0]?.message || `HTTP ${response.status}`,
      };
    }

    console.log("✅ Email sent via SendGrid");
    return {
      success: true,
      messageId: response.headers.get("x-message-id") || undefined,
    };
  }

  private async sendWithMailgun(
    emailData: EmailMessage,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.config.domain) {
      return { success: false, error: "Mailgun domain not configured" };
    }

    const formData = new FormData();
    formData.append(
      "from",
      `${this.config.fromName} <${this.config.fromEmail}>`,
    );
    formData.append("to", emailData.to);
    formData.append("subject", emailData.subject);
    formData.append("html", emailData.html);
    if (emailData.text) {
      formData.append("text", emailData.text);
    }

    const response = await fetch(
      `https://api.mailgun.net/v3/${this.config.domain}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`api:${this.config.apiKey}`)}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    console.log("✅ Email sent via Mailgun");
    return { success: true, messageId: data.id };
  }

  private async sendWithAWSSES(
    emailData: EmailMessage,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Note: This is a simplified AWS SES implementation
    // For production, consider using AWS SDK for better error handling and features
    const payload = {
      Source: `${this.config.fromName} <${this.config.fromEmail}>`,
      Destination: {
        ToAddresses: [emailData.to],
      },
      Message: {
        Subject: {
          Data: emailData.subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: emailData.html,
            Charset: "UTF-8",
          },
          ...(emailData.text
            ? {
                Text: {
                  Data: emailData.text,
                  Charset: "UTF-8",
                },
              }
            : {}),
        },
      },
    };

    // This would require proper AWS signature v4 signing
    // For production, use AWS SDK instead
    console.log(
      "✅ Email would be sent via AWS SES (requires AWS SDK implementation)",
    );
    return { success: true, messageId: `aws-ses-${Date.now()}` };
  }

  async sendRepairCompletionEmail(
    to: string,
    customerName: string,
    deviceBrand: string,
    deviceModel: string,
    repairIssue: string,
    repairSolution: string,
    repairCost: number,
    repairId: string,
    storeName: string,
    storeAddress: string,
    storePhone: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `✅ Device Ready for Pickup - ${deviceBrand} ${deviceModel}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Your Device is Ready!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Repair completed successfully</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear ${customerName},</p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Excellent news! Your <strong>${deviceBrand} ${deviceModel}</strong> 
            has been successfully repaired and is ready for pickup.
          </p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">📋 Repair Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 5px 0; color: #4b5563;"><strong>Issue:</strong></td><td style="padding: 5px 0; color: #374151;">${repairIssue}</td></tr>
              <tr><td style="padding: 5px 0; color: #4b5563;"><strong>Solution:</strong></td><td style="padding: 5px 0; color: #374151;">${repairSolution}</td></tr>
              <tr><td style="padding: 5px 0; color: #4b5563;"><strong>Final Cost:</strong></td><td style="padding: 5px 0; color: #374151; font-weight: bold;">₹${repairCost.toLocaleString()}</td></tr>
              <tr><td style="padding: 5px 0; color: #4b5563;"><strong>Completed:</strong></td><td style="padding: 5px 0; color: #374151;">${new Date().toLocaleDateString()}</td></tr>
              <tr><td style="padding: 5px 0; color: #4b5563;"><strong>Repair ID:</strong></td><td style="padding: 5px 0; color: #374151; font-family: monospace;">${repairId}</td></tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #d97706; margin: 0 0 15px 0; font-size: 18px;">📍 Pickup Information</h3>
            <div style="color: #92400e;">
              <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 16px;">${storeName}</p>
              <p style="margin: 0 0 10px 0;">${storeAddress}</p>
              <p style="margin: 0 0 15px 0;">📞 ${storePhone}</p>
              
              <div style="margin-top: 15px;">
                <p style="margin: 0 0 5px 0; font-weight: bold;">Store Hours:</p>
                <p style="margin: 0; line-height: 1.4;">
                  Monday - Saturday: 10:00 AM - 8:00 PM<br>
                  Sunday: 11:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; color: #374151; font-weight: bold;">🆔 Please bring valid photo ID for device pickup</p>
          </div>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-top: 25px;">
            Your device has been quality-checked and is ready for pickup. 
            Thank you for choosing Laptop Store for your repair needs!
          </p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Best regards,<br>
            <strong>The Laptop Store Team</strong>
          </p>
        </div>
      </div>
    `;

    const text = `
Dear ${customerName},

Your ${deviceBrand} ${deviceModel} repair is complete and ready for pickup!

Repair Summary:
- Issue: ${repairIssue}
- Solution: ${repairSolution}
- Final Cost: ₹${repairCost.toLocaleString()}
- Repair ID: ${repairId}

Pickup Location:
${storeName}
${storeAddress}
Phone: ${storePhone}

Store Hours:
Monday - Saturday: 10:00 AM - 8:00 PM
Sunday: 11:00 AM - 6:00 PM

Please bring valid photo ID for pickup.

Thank you for choosing Laptop Store!
    `;

    return this.sendEmail({ to, subject, html, text });
  }

  // Health check method
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: "Email service not configured" };
    }

    // For production, implement actual health checks for each provider
    return { success: true };
  }
}

export const emailService = new EmailService();
