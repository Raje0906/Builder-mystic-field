import React, { useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { repairService } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Phone, Mail, Calendar, Clock, CheckCircle, AlertTriangle, Loader2, Wrench, User, Check } from "lucide-react";

interface Repair {
  ticketNumber: string;
  status: string;
  device: string;
  issue: string;
  receivedDate: string;
  estimatedCompletion: string;
  totalCost: number;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
}

export function TrackRepair() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState<"ticket" | "phone" | "email">("ticket");
  const [foundRepairs, setFoundRepairs] = useState<Repair[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCompleting, setIsCompleting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  
  // Button is now available to all users

  const handleCompleteRepair = async (ticketNumber: string) => {
    if (!window.confirm('Are you sure you want to mark this repair as complete? This will notify the customer.')) {
      return;
    }

    try {
      setIsCompleting(prev => ({ ...prev, [ticketNumber]: true }));
      
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';
      const response = await axios.post(
        `${baseUrl}/api/repairs/${ticketNumber}/complete`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Repair marked as completed and customer has been notified.",
          variant: "default",
        });
        
        // Refresh the repairs list
        await searchRepairs();
      }
    } catch (error) {
      console.error('Error completing repair:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to mark repair as completed',
        variant: "destructive",
      });
    } finally {
      setIsCompleting(prev => ({ ...prev, [ticketNumber]: false }));
    }
  };

  const searchRepairs = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSearching(true);
      
      // Build query parameters based on search type
      const params = new URLSearchParams();
      
      if (searchBy === "ticket") {
        params.append("ticket", searchQuery.trim());
      } else if (searchBy === "phone") {
        const phoneNumber = searchQuery.replace(/\D/g, "");
        params.append("phone", phoneNumber);
      } else if (searchBy === "email") {
        params.append("email", searchQuery.trim().toLowerCase());
      }

      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';
      const apiUrl = `${baseUrl}/api/repairs/track/status?${params.toString()}`;
      console.log('Constructed API URL:', apiUrl);

      try {
        console.log('Sending request to:', apiUrl);
        console.log('Request headers:', {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'withCredentials': true
        });
        
        const response = await axios.get(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true,  // Include credentials for CORS
          validateStatus: (status) => status < 500 // Don't throw for 4xx errors
        });

        console.log('API Response Status:', response.status);
        console.log('API Response Headers:', response.headers);
        console.log('API Response Data:', response.data);

        if (response.status === 200 && response.data?.success) {
          const repairs = Array.isArray(response.data.data) 
            ? response.data.data 
            : [response.data.data];
          
          if (repairs.length === 0) {
            throw new Error('No repairs found with the provided details');
          }
          
          // Transform the response to match the Repair interface
          const formattedRepairs = repairs.map(repair => ({
            ...repair,
            // Ensure all required fields have proper defaults
            customer: {
              name: repair.customer?.name || 'N/A',
              phone: repair.customer?.phone || 'N/A',
              email: repair.customer?.email || 'N/A',
              address: {
                line1: repair.customer?.address?.line1 || '',
                line2: repair.customer?.address?.line2 || '',
                city: repair.customer?.address?.city || '',
                state: repair.customer?.address?.state || '',
                pincode: repair.customer?.address?.pincode || ''
              }
            }
          }));
          
          setFoundRepairs(formattedRepairs);
        } else {
          throw new Error(response.data?.message || 'Failed to search for repairs');
        }
      } catch (error) {
        console.error('API Error:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const message = error.response.data?.message || 'Failed to search for repairs';
          throw new Error(`Server responded with status ${error.response.status}: ${message}`);
        } else if (error.request) {
          // The request was made but no response was received
          throw new Error('No response from server. Please check your connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          throw new Error(`Request error: ${error.message}`);
        }
      }
    } catch (error) {
      console.error("Error searching repairs:", error);
      let errorMessage = "Failed to search for repairs. ";
      
      if ((error as Error).message.includes('404')) {
        errorMessage = "No repairs found with the provided details.";
      } else if ((error as Error).message.includes('400')) {
        errorMessage = "Invalid search parameters. Please check your input.";
      } else if ((error as Error).message.includes('Network Error')) {
        errorMessage = "Unable to connect to the server. Please check your connection.";
      } else {
        errorMessage += (error as Error).message || 'Please try again later.';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setFoundRepairs([]); // Clear any previous results on error
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
      completed: {
        label: "Completed",
        variant: "bg-green-100 text-green-800 hover:bg-green-200",
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      },
      delivered: {
        label: "Delivered",
        variant: "bg-green-100 text-green-800 hover:bg-green-200",
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      },
      cancelled: {
        label: "Cancelled",
        variant: "bg-red-100 text-red-800 hover:bg-red-200",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      },
      in_progress: {
        label: "In Progress",
        variant: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        icon: <Wrench className="h-3 w-3 mr-1" />
      },
      received: {
        label: "Received",
        variant: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        icon: <Clock className="h-3 w-3 mr-1" />
      },
      default: {
        label: status.replace('_', ' '),
        variant: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        icon: <Clock className="h-3 w-3 mr-1" />
      }
    };

    const statusInfo = statusMap[status] || statusMap.default;
    
    return (
      <Badge className={statusInfo.variant}>
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  const getProgressValue = (status: string) => {
    const progressMap: Record<string, number> = {
      received: 20,
      diagnosed: 40,
      approved: 60,
      in_progress: 80,
      completed: 100,
      delivered: 100,
      cancelled: 0
    };
    
    return progressMap[status] || 0;
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Track Your Repair</CardTitle>
          <CardDescription>
            Enter your ticket number or phone number to check the status of your repair.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={searchBy === "ticket" ? "default" : "outline"}
                onClick={() => setSearchBy("ticket")}
                className="flex-1 sm:flex-none"
              >
                <Search className="mr-2 h-4 w-4" /> Ticket
              </Button>
              <Button
                variant={searchBy === "phone" ? "default" : "outline"}
                onClick={() => setSearchBy("phone")}
                className="flex-1 sm:flex-none"
              >
                <Phone className="mr-2 h-4 w-4" /> Phone
              </Button>
              <Button
                variant={searchBy === "email" ? "default" : "outline"}
                onClick={() => setSearchBy("email")}
                className="flex-1 sm:flex-none"
              >
                <Mail className="mr-2 h-4 w-4" /> Email
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                type={searchBy === "phone" ? "tel" : searchBy === "email" ? "email" : "text"}
                placeholder={
                  searchBy === "ticket"
                    ? "Enter your ticket number"
                    : searchBy === "phone"
                    ? "Enter your phone number (with country code)"
                    : "Enter your email address"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchRepairs()}
                className="flex-1"
              />
              <Button 
                onClick={searchRepairs} 
                disabled={isSearching}
                className="w-24"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-1" />
                )}
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {foundRepairs.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            {foundRepairs.length} {foundRepairs.length === 1 ? 'Repair Found' : 'Repairs Found'}
          </h2>
          {foundRepairs.map((repair: Repair) => (
            <Card key={repair.ticketNumber} className="overflow-hidden">
              <CardHeader className="bg-gray-50 p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {repair.device}
                      </h3>
                      {getStatusBadge(repair.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ticket: {repair.ticketNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ₹{repair.totalCost?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Received: {new Date(repair.receivedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Repair Progress</span>
                      <span>{getProgressValue(repair.status)}%</span>
                    </div>
                    <Progress value={getProgressValue(repair.status)} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Received</span>
                      <span>Diagnosed</span>
                      <span>In Progress</span>
                      <span>Completed</span>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column - Customer Details */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Customer Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">{repair.customer.name}</p>
                        <p className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                          {repair.customer.phone}
                        </p>
                        <p className="flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                          {repair.customer.email || 'No email provided'}
                        </p>
                        <p className="text-muted-foreground text-xs mt-2">
                          {repair.customer.address.line1}
                          {repair.customer.address.line2 && `, ${repair.customer.address.line2}`}
                          {repair.customer.address.city && `, ${repair.customer.address.city}`}
                          {repair.customer.address.state && `, ${repair.customer.address.state}`}
                          {repair.customer.address.pincode && ` - ${repair.customer.address.pincode}`}
                        </p>
                      </div>
                    </div>

                    {/* Right Column - Repair Details */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Wrench className="h-4 w-4 mr-2" />
                        Repair Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-medium">Issue</p>
                          <p className="text-muted-foreground">{repair.issue}</p>
                        </div>
                        <div>
                          <p className="font-medium">Estimated Completion</p>
                          <p className="text-muted-foreground">
                            {repair.estimatedCompletion 
                              ? new Date(repair.estimatedCompletion).toLocaleDateString() 
                              : 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Updates */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Status Updates
                    </h4>
                    <div className="relative">
                      <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
                      <div className="space-y-4">
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-1 h-2 w-2 rounded-full bg-primary"></div>
                          <div className="text-sm">
                            <p className="font-medium">Repair {repair.status.replace('_', ' ')}</p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(repair.receivedDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {(repair.status === 'completed' || repair.status === 'delivered') && (
                          <div className="relative pl-8">
                            <div className="absolute left-0 top-1 h-2 w-2 rounded-full bg-green-500"></div>
                            <div className="text-sm">
                              <p className="font-medium">
                                {repair.status === 'delivered' ? 'Device Delivered' : 'Repair Completed'}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {new Date(repair.estimatedCompletion || repair.receivedDate).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {repair.status !== 'completed' && repair.status !== 'delivered' && (
                          <div className="relative pl-8">
                            <div className="absolute left-0 top-1 h-2 w-2 rounded-full border-2 border-gray-300"></div>
                            <div className="text-sm text-muted-foreground">
                              <p>Awaiting completion</p>
                              <Button 
                                size="sm" 
                                className="mt-2" 
                                onClick={() => handleCompleteRepair(repair.ticketNumber)}
                                disabled={isCompleting[repair.ticketNumber]}
                              >
                                {isCompleting[repair.ticketNumber] ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Completing...
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Mark as Complete
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
