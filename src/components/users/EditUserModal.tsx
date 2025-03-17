import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUserDetails, useUpdateUser, uploadProfilePicture } from '@/hooks/use-user-actions';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';

const userFormSchema = z.object({
  full_names: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  gender: z.string().min(1, { message: 'Please select a gender.' }),
  role: z.number(),
  cellphone: z.string().optional(),
  home_address: z.string().optional(),
  date_of_birth: z.string().optional(),
  profile_picture: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface EditUserModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditUserModal = ({ userId, isOpen, onClose }: EditUserModalProps) => {
  const { data: user, isLoading } = useUserDetails(userId);
  const updateUser = useUpdateUser();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      full_names: '',
      email: '',
      gender: '',
      role: 3,
      cellphone: '',
      home_address: '',
      date_of_birth: '',
      profile_picture: '',
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        full_names: user.full_names || '',
        email: user.email || '',
        gender: user.gender || '',
        role: user.role || 3,
        cellphone: user.cellphone || '',
        home_address: user.home_address || '',
        date_of_birth: user.date_of_birth || '',
        profile_picture: user.profile_picture || '',
      });
    }
  }, [user, form]);

  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    setIsUploading(true);
    
    try {
      const publicUrl = await uploadProfilePicture(file, userId);
      form.setValue('profile_picture', publicUrl);
      
      toast({
        title: 'Image uploaded',
        description: 'Profile picture has been uploaded successfully.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload profile picture',
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSubmit = async (data: UserFormValues) => {
    if (userId) {
      try {
        await updateUser.mutateAsync({
          id: userId,
          ...data,
        });
        onClose();
      } catch (error) {
        console.error("Error updating user:", error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Make changes to the user's information.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="profile_picture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center">
                          <div 
                            className="relative cursor-pointer group" 
                            onClick={handlePictureClick}
                          >
                            <Avatar className="h-20 w-20 border-2 border-border">
                              {field.value ? (
                                <AvatarImage src={field.value} alt="Profile" />
                              ) : (
                                <AvatarFallback>
                                  {form.getValues().full_names
                                    ? form.getValues().full_names.split(' ').map(n => n[0]).join('').toUpperCase()
                                    : 'U'
                                  }
                                </AvatarFallback>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                {isUploading ? (
                                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                                ) : (
                                  <Camera className="h-5 w-5 text-white" />
                                )}
                              </div>
                            </Avatar>
                          </div>
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handlePictureUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                          Click the avatar to upload a new picture
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_names"
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
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cellphone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cellphone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="home_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Address" className="resize-none h-20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Admin</SelectItem>
                        <SelectItem value="2">Editor</SelectItem>
                        <SelectItem value="3">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" onClick={onClose} size="sm">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUser.isPending || isUploading} size="sm">
                  {updateUser.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
