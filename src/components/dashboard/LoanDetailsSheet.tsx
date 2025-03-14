
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Check, Clock, CreditCard, Home, Info, Mail, MapPin, Phone, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface LoanDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  loan: any;
}

const LoanDetailsSheet = ({ isOpen, onClose, loan }: LoanDetailsSheetProps) => {
  if (!loan) return null;

  const formatCurrency = (value: string | number) => {
    // Handle case where the value might be a string with 'R' prefix or a number
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/R/g, '') || '0') : value;
    return `R${numValue.toFixed(2)}`;
  };

  // Ensure totalReturn is properly formatted
  const totalReturn = loan.totalReturn || loan.amount;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>Loan Details</SheetTitle>
          <SheetDescription>
            View detailed information about the loan
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Client Information */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={loan.image || "/placeholder.svg"} alt={loan.name} />
              <AvatarFallback className="text-lg">
                {loan.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{loan.name || "Unknown"}</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{loan.email || "No email"}</span>
              </div>
              {loan.phone && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{loan.phone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Loan Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge 
              variant={loan.status ? 'outline' : 'secondary'}
              className={`
                ${loan.status 
                  ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400 hover:bg-green-100' 
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-400 hover:bg-orange-100'}
              `}
            >
              {loan.status ? (
                <Check className="h-3.5 w-3.5 mr-1" />
              ) : (
                <Clock className="h-3.5 w-3.5 mr-1" />
              )}
              {loan.status ? 'Paid' : 'Pending'}
            </Badge>
          </div>

          {/* Loan Amount Details */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Loan Amount</span>
                </div>
                <span className="font-medium">{formatCurrency(loan.amount)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Return</span>
                </div>
                <span className="font-medium">{formatCurrency(totalReturn)}</span>
              </div>
              
              {loan.due_date && !loan.status && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Due Date</span>
                  </div>
                  <span className="font-medium">
                    {new Date(loan.due_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Details */}
          {loan.id_number && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">ID Number</span>
              </div>
              <span className="text-sm">{loan.id_number}</span>
            </div>
          )}

          {loan.address && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Address</span>
              </div>
              <span className="text-sm max-w-[60%] text-right">{loan.address}</span>
            </div>
          )}

          {loan.purpose && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Purpose</span>
              </div>
              <span className="text-sm max-w-[60%] text-right">{loan.purpose}</span>
            </div>
          )}

          {loan.bank && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Bank</span>
              </div>
              <span className="text-sm">{loan.bank}</span>
            </div>
          )}

          {loan.account_number && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Account Number</span>
              </div>
              <span className="text-sm">{loan.account_number}</span>
            </div>
          )}

          <div className="pt-4">
            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LoanDetailsSheet;
