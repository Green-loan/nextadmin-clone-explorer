import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Link, useNavigate } from 'react-router-dom';
import { CalendarIcon, DollarSign, Clock, Users, ArrowRight, CheckCircle, ChevronRight, FileText } from "lucide-react";
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import DocumentUploadField from '@/components/loan/DocumentUploadField';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  id_number: z.string().min(6, {
    message: "ID number must be at least 6 characters.",
  }),
  gender: z.string({
    required_error: "Please select a gender.",
  }),
  dob: z.date({
    required_error: "Please select a date of birth.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number.",
  }),
  bank: z.string().min(2, {
    message: "Bank name must be at least 2 characters.",
  }),
  account_number: z.string().min(5, {
    message: "Account number must be at least 5 characters.",
  }),
  purpose: z.string().min(5, {
    message: "Please describe your purpose for this loan.",
  }),
  due_date: z.date({
    required_error: "Please select a due date.",
  }),
});

const LandingPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [bankStatement, setBankStatement] = useState<File | null>(null);
  const [idDocumentError, setIdDocumentError] = useState<string>('');
  const [bankStatementError, setBankStatementError] = useState<string>('');
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      id_number: "",
      gender: "",
      address: "",
      amount: "",
      bank: "",
      account_number: "",
      purpose: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    // Validate document uploads
    if (!idDocument) {
      setIdDocumentError('ID document is required');
      return;
    }
    
    if (!bankStatement) {
      setBankStatementError('Bank statement is required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Calculate due date
      const dueDate = data.due_date;
      
      // Convert amount to number
      const amount = parseFloat(data.amount);
      
      // Calculate return amount (with 39.99% interest)
      const returnAmount = (amount * 1.3999).toFixed(2);
      
      // Submit loan application to Supabase
      const { data: loanData, error } = await supabase.from('loan_applications').insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        id_number: data.id_number,
        gender: data.gender,
        dob: data.dob.toISOString().split('T')[0],
        address: data.address,
        amount: amount,
        bank: data.bank,
        account_number: data.account_number,
        purpose: data.purpose,
        due_date: dueDate.toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
      }).select('id').single();
      
      if (error) {
        throw error;
      }
      
      // Upload documents
      if (loanData?.id) {
        // Upload ID document
        const idExt = idDocument.name.split('.').pop();
        const idPath = `loan-documents/${loanData.id}_id_document_${Date.now()}.${idExt}`;
        
        const { error: idUploadError } = await supabase.storage
          .from('loans')
          .upload(idPath, idDocument);
        
        if (idUploadError) throw idUploadError;
        
        // Get public URL for ID document
        const { data: idUrlData } = supabase.storage
          .from('loans')
          .getPublicUrl(idPath);
        
        // Upload bank statement
        const bankExt = bankStatement.name.split('.').pop();
        const bankPath = `loan-documents/${loanData.id}_bank_statement_${Date.now()}.${bankExt}`;
        
        const { error: bankUploadError } = await supabase.storage
          .from('loans')
          .upload(bankPath, bankStatement);
        
        if (bankUploadError) throw bankUploadError;
        
        // Get public URL for bank statement
        const { data: bankUrlData } = supabase.storage
          .from('loans')
          .getPublicUrl(bankPath);
        
        // Update loan application with document URLs
        const { error: updateError } = await supabase
          .from('loan_applications')
          .update({
            id_document_url: idUrlData?.publicUrl,
            bank_statement_url: bankUrlData?.publicUrl,
          })
          .eq('id', loanData.id);
        
        if (updateError) throw updateError;
      }
      
      // Show success message
      toast.success("Loan application submitted successfully!", {
        description: "We will review your application and get back to you soon.",
      });
      
      // Reset form
      form.reset();
      setIdDocument(null);
      setBankStatement(null);
      
    } catch (error) {
      console.error("Error submitting loan application:", error);
      toast.error("Error submitting loan application", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="py-6 px-4 md:px-6 bg-white dark:bg-gray-950 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/b315bad7-f9f7-4aa6-a74d-1d8abc0d353d.png" 
              alt="Green Finance Logo" 
              className="h-10 w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/signin">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="default" size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 md:px-6 container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Need a loan? <span className="text-green-600 dark:text-green-400">We've got you covered</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Green Finance offers quick and easy loans with competitive interest rates. Apply today and get approved in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2" onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}>
                Apply Now <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/signin">Login to Dashboard</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
              alt="Financial growth illustration" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-6 bg-white dark:bg-gray-950">
        <div className="container mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Why Choose Green Finance?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We offer a streamlined loan process with competitive rates and flexible repayment options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover-scale dark:border-gray-800">
              <CardHeader>
                <Clock className="h-10 w-10 text-green-600 dark:text-green-400 mb-2" />
                <CardTitle>Quick Approval</CardTitle>
                <CardDescription>
                  Get your loan approved in as little as 24 hours.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover-scale dark:border-gray-800">
              <CardHeader>
                <DollarSign className="h-10 w-10 text-green-600 dark:text-green-400 mb-2" />
                <CardTitle>Competitive Rates</CardTitle>
                <CardDescription>
                  Our loan rates are designed to be affordable and transparent.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover-scale dark:border-gray-800">
              <CardHeader>
                <Users className="h-10 w-10 text-green-600 dark:text-green-400 mb-2" />
                <CardTitle>Dedicated Support</CardTitle>
                <CardDescription>
                  Our team is here to help you every step of the way.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="application-form" className="py-16 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-950 rounded-xl shadow-xl p-6 md:p-10 dark:border dark:border-gray-800">
            <div className="space-y-4 mb-8">
              <h2 className="text-3xl font-bold">Apply for a Loan</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Fill out the form below to apply for a loan. We'll review your application and get back to you as soon as possible.
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+27 123 456 7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="id_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="ID12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="123 Main St, City, Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Amount (ZAR)</FormLabel>
                        <FormControl>
                          <Input placeholder="5000" {...field} />
                        </FormControl>
                        <FormDescription>
                          {field.value && !isNaN(Number(field.value)) ? 
                            `Return amount with interest: R${(Number(field.value) * 1.3999).toFixed(2)}` : 
                            'Enter an amount to see the return value with interest'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Standard Bank" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Purpose</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select purpose" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="personal">Personal</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="medical">Medical</SelectItem>
                            <SelectItem value="housing">Housing</SelectItem>
                            <SelectItem value="debt">Debt Consolidation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date()
                              }
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Document Upload Fields */}
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-lg font-medium mb-4">Required Documents</h3>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <DocumentUploadField
                      label="ID Document"
                      description="Upload a scanned copy of your ID or passport (PDF, JPG, PNG)"
                      id="id-document"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(file) => {
                        setIdDocument(file);
                        setIdDocumentError('');
                      }}
                      error={idDocumentError}
                    />
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <DocumentUploadField
                      label="3 Months Bank Statement"
                      description="Upload your last 3 months bank statement (PDF format preferred)"
                      id="bank-statement"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(file) => {
                        setBankStatement(file);
                        setBankStatementError('');
                      }}
                      error={bankStatementError}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Loan Application"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 px-4 md:px-6 bg-white dark:bg-gray-950">
        <div className="container mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our loan process is simple, quick, and hassle-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
                <span className="text-green-600 dark:text-green-400 text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold">Apply Online</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Fill out our simple application form with your details.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
                <span className="text-green-600 dark:text-green-400 text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold">Quick Verification</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI system verifies your application and documents.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
                <span className="text-green-600 dark:text-green-400 text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold">Get Approved</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Receive approval notification and loan terms.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
                <span className="text-green-600 dark:text-green-400 text-xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-semibold">Receive Funds</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get the money directly transferred to your bank account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 md:px-6">
        <div className="container mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">What Our Clients Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Read what our satisfied customers have to say about their experience with Green Finance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover-scale dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    "The application process was incredibly smooth. I got approved within 24 hours and had the money in my account the next day."
                  </p>
                  <div>
                    <p className="font-semibold">Sarah M.</p>
                    <p className="text-sm text-gray-500">Business Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-scale dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    "I needed funds for my child's education, and Green Finance made it possible with their reasonable interest rates and flexible repayment."
                  </p>
                  <div>
                    <p className="font-semibold">John D.</p>
                    <p className="text-sm text-gray-500">Father of two</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover-scale dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    "Green Finance made my home renovation possible. Their team was supportive throughout the entire process."
                  </p>
                  <div>
                    <p className="font-semibold">Michael T.</p>
                    <p className="text-sm text-gray-500">Homeowner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img 
                src="/lovable-uploads/b315bad7-f9f7-4aa6-a74d-1d8abc0d353d.png" 
                alt="Green Finance Logo" 
                className="h-10 w-auto mb-4"
              />
              <p className="text-gray-400 mt-2">
                Your trusted partner for all your financial needs.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <address className="not-italic text-gray-400 space-y-2">
                <p>123 Finance Street</p>
                <p>Johannesburg, South Africa</p>
                <p>Email: info@greenfinance.com</p>
                <p>Phone: +27 123 456 7890</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Green Finance. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
