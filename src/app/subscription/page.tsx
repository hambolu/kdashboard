'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { subscriptionApi, type SubscriptionPlan } from '@/api/subscriptionApi';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { PencilIcon, TrashIcon, PowerIcon } from 'lucide-react';
import clsx from 'clsx';

// Form schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Amount must be 0 or greater'),
  duration_days: z.number().min(1, 'Duration must be at least 1 day'),
  features: z.string().optional(),
  is_active: z.boolean().default(true),
  plan_code: z.string().optional()
});

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration_days: 30,
      features: '',
      is_active: true,
      plan_code: '',
    },
    mode: 'onChange',
  });

  // Table columns
  const columns: ColumnDef<SubscriptionPlan>[] = [
    {
      accessorKey: 'name',
      header: () => <span className="text-gray-900 dark:text-white font-medium">Name</span>,
      cell: ({ row }) => (
        <span className="text-gray-900 dark:text-white font-medium">{row.getValue('name')}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: () => <span className="text-gray-900 dark:text-white font-medium">Description</span>,
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">{row.getValue('description')}</span>
      ),
    },
    {
      accessorKey: 'price',
      header: () => <span className="text-gray-900 dark:text-white font-medium">Price</span>,
      cell: ({ row }) => {
        const price = row.getValue('price');
       
        return (
          <div className="font-medium text-gray-900 dark:text-white">
            {typeof price === 'number'
              ? new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: 'NGN'
                }).format(price)
              : ''}
          </div>
        );
      },
    },
    {
      accessorKey: 'duration_days',
      header: () => <span className="text-gray-900 dark:text-white font-medium">Duration (days)</span>,
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.getValue('duration_days')} days
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: () => <span className="text-gray-900 dark:text-white font-medium">Status</span>,
      cell: ({ row }) => {
        const isActive = row.getValue('is_active');
        return (
          <Badge 
            variant={isActive ? 'success' : 'destructive'}
            className={clsx(
              "font-medium",
              isActive ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : 
                        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
            )}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const plan = row.original;
        return (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleEdit(plan)}
              className="hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleToggleStatus(plan)}
              className="hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
            >
              <PowerIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleDelete(plan)}
              className="hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const { } = useAuth();

  const loadPlans = useCallback(async () => {
    try {
      const response = await subscriptionApi.getAllPlans();
      setPlans(response.data);
    } catch (err) {
      console.error('Error loading plans:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to load subscription plans',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleToggleStatus = useCallback(async (plan: SubscriptionPlan) => {
    try {
      await subscriptionApi.togglePlanStatus(plan.id);
      await loadPlans();
      toast({
        title: 'Success',
        description: `Plan ${plan.is_active ? 'deactivated' : 'activated'} successfully`,
        variant: 'success',
      });
    } catch (err) {
      console.error('Error toggling plan status:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update plan status',
        variant: 'destructive',
      });
    }
  }, [loadPlans, toast]);

  const handleDelete = useCallback(async (plan: SubscriptionPlan) => {
    if (!plan) return;
    try {
      await subscriptionApi.deletePlan(plan.id);
      await loadPlans();
      toast({
        title: 'Success',
        description: 'Plan deleted successfully',
        variant: 'success',
      });
    } catch (err) {
      console.error('Error deleting plan:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete plan',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  }, [loadPlans, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        ...values,
        price: Number(values.price),
        duration_days: Number(values.duration_days),
        features: values.features || '' // Ensure features is never undefined
      };

      if (editingPlan) {
        await subscriptionApi.updatePlan(editingPlan.id, payload);
      } else {
        await subscriptionApi.createPlan(payload);
      }

      setIsDialogOpen(false);
      form.reset();
      
      toast({
        title: 'Success',
        description: `Subscription plan ${editingPlan ? 'updated' : 'created'} successfully`,
        variant: 'success',
      });

      await loadPlans();
    } catch (err) {
      console.error('Error saving plan:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save subscription plan',
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;

    try {
      await subscriptionApi.deletePlan(planToDelete.id);

      toast({
        title: 'Success',
        description: 'Subscription plan deleted successfully',
        variant: 'success',
      });

      await loadPlans();
    } catch (err) {
      console.error('Error deleting plan:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete subscription plan',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  }

  async function handleEdit(plan: SubscriptionPlan) {
    if (plan.is_commission_plan) {
      toast({
        title: 'Error',
        description: 'Commission plans cannot be edited',
        variant: 'destructive',
      });
      return;
    }
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      description: plan.description,
      price: Number(plan.price),
      duration_days: Number(plan.duration_days),
      features: plan.features || '',
      is_active: plan.is_active,
      plan_code: plan.plan_code || '',
    });
    setIsDialogOpen(true);
  }

  return (
    <div className="container mx-auto py-10 text-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
        <Button 
          onClick={() => {
            setEditingPlan(null);
            form.reset();
            setIsDialogOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Add New Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-white"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No subscription plans found
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="bg-white dark:bg-white/[0.02]">
            <DataTable
              columns={columns}
              data={plans}
            />
          </div>
        </div>
      )}

      <Dialog modal open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 border dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">{editingPlan ? 'Edit' : 'Create'} Subscription Plan</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white">Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white">Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700" 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white">Duration (days)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700" />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white">Features (optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel className="text-gray-900 dark:text-white">Active</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plan_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white">Plan Code (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        readOnly={!!editingPlan}
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700" 
                      />
                    </FormControl>
                    {editingPlan && (
                      <FormDescription className="text-gray-500 dark:text-gray-400">
                        Plan code cannot be modified after creation
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {editingPlan ? 'Update' : 'Create'} Plan
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-900 border dark:border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              This action cannot be undone. This will permanently delete the subscription plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
