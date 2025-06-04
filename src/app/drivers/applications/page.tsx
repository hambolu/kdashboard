"use client";
import { useEffect, useState, useCallback } from 'react';
import { driverApi } from '@/api/driverApi';
import { toast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card/Card";

interface Driver {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  status: string;
  created_at: string;
  driver_category_id: number | null;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface PaginationData {
  current_page: number;
  per_page: number;
  total: number;
}

export default function DriverApplicationsPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    per_page: 10,
    total: 0
  });

  const fetchData = useCallback(async () => {
    try {
      const [driversResponse, categoriesResponse] = await Promise.all([
        driverApi.getAllDrivers({ 
          status: 'pending',
          per_page: pagination.per_page,
          page: pagination.current_page
        }),
        driverApi.getAllCategories()
      ]);

      setDrivers(driversResponse.data.data);
      setPagination({
        current_page: driversResponse.data.current_page,
        per_page: driversResponse.data.per_page,
        total: driversResponse.data.total
      });
      setCategories(categoriesResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, pagination.per_page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCategoryChange = async (driverId: number, categoryId: string) => {
    try {
      setUpdating(driverId);
      await driverApi.updateDriverCategory(driverId, parseInt(categoryId));
      toast({
        title: "Success",
        description: "Driver category updated successfully",
        variant: "success",
      });
      fetchData();
    } catch (err) {
      console.error('Error updating category:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update driver category",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleApproveDriver = async (driverId: number) => {
    try {
      setUpdating(driverId);
      await driverApi.approveDriver(driverId);
      toast({
        title: "Success",
        description: "Driver approved successfully",
        variant: "success",
      });
      fetchData();
    } catch (err) {
      console.error('Error approving driver:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to approve driver",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, current_page: newPage }));
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPagination(prev => ({ ...prev, per_page: newPerPage, current_page: 1 }));
  };

  return (
    <Card className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Driver Applications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                  <TableRow>
                    <TableHead className="text-gray-600 dark:text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">Email</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">Phone</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">Category</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {drivers.map((driver) => (
                    <TableRow key={driver.id} className="dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="text-gray-800 dark:text-white/90">
                        {driver.user ? `${driver.user.first_name} ${driver.user.last_name}` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-800 dark:text-white/90">
                        {driver.user?.email || 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-800 dark:text-white/90">
                        {driver.user?.phone_number || 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-800 dark:text-white/90">
                        {driver.status}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={driver.driver_category_id?.toString() || ''}
                          onValueChange={(value) => handleCategoryChange(driver.id, value)}
                          disabled={updating === driver.id}
                        >
                          <SelectTrigger className="w-40 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white/90">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800">
                            {categories.map((category) => (
                              <SelectItem 
                                key={category.id} 
                                value={category.id.toString()}
                                className="dark:text-white/90 dark:hover:bg-gray-700"
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="default"
                          onClick={() => handleApproveDriver(driver.id)}
                          disabled={updating === driver.id || !driver.driver_category_id}
                          className="w-full sm:w-auto"
                        >
                          {updating === driver.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Approve'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 flex items-center justify-between px-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                Rows per page:
                <Select
                  value={pagination.per_page.toString()}
                  onValueChange={(value) => handlePerPageChange(Number(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Page {pagination.current_page} of {Math.ceil(pagination.total / pagination.per_page)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page >= Math.ceil(pagination.total / pagination.per_page)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
