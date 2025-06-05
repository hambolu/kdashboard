'use client';

import React, { useState, useEffect, ChangeEvent, useCallback } from 'react';
import Image from 'next/image';
import { Box, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Driver, driverApi, DriverStats, DriverCategory } from '@/api/driverApi';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import toast from 'react-hot-toast';

type DriverActionType = 'approve' | 'reject' | 'suspend' | 'category';
type DriverStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

const statusColors: Record<DriverStatus, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  suspended: 'error',
};

const DriversPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [categories, setCategories] = useState<DriverCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<DriverStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>();
  const [actionDialog, setActionDialog] = useState({
    open: false,
    action: 'reject' as DriverActionType,
    reason: '',
  });

  const fetchDrivers = useCallback(async () => {
    try {
      const params: {
        per_page: number;
        page: number;
        status?: DriverStatus;
        search?: string;
      } = {
        per_page: rowsPerPage,
        page: page + 1,
      };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await driverApi.getAllDrivers(params);
      setDrivers(response.data);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to fetch drivers');
    }
  }, [page, rowsPerPage, statusFilter, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await driverApi.getDriverStatistics();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to fetch statistics');
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await driverApi.getAllCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to fetch driver categories');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDrivers(), fetchStats(), fetchCategories()]);
      setLoading(false);
    };
    loadData();
  }, [fetchDrivers, fetchStats, fetchCategories]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActionDialogOpen = (driver: Driver, action: 'reject' | 'suspend' | 'category') => {
    setSelectedDriver(driver);
    setSelectedCategoryId(driver.driver_category_id || '');
    setActionDialog({ open: true, action, reason: '' });
  };

  const handleActionDialogClose = () => {
    setSelectedDriver(null);
    setSelectedCategoryId('');
    setActionDialog({ open: false, action: 'reject', reason: '' });
  };

  const handleDriverAction = async (driver: Driver, action: DriverActionType) => {
    if (!driver) return;
    
    try {
      switch (action) {
        case 'approve':
          await driverApi.approveDriver(driver.id);
          toast.success('Driver approved successfully');
          break;
        case 'reject':
          if (!actionDialog.reason) {
            toast.error('Rejection reason is required');
            return;
          }
          await driverApi.rejectDriver(driver.id, actionDialog.reason);
          toast.success('Driver rejected successfully');
          break;
        case 'suspend':
          if (!actionDialog.reason) {
            toast.error('Suspension reason is required');
            return;
          }
          await driverApi.suspendDriver(driver.id, actionDialog.reason);
          toast.success('Driver suspended successfully');
          break;
        case 'category':
          if (!selectedCategoryId) {
            toast.error('Please select a category');
            return;
          }
          await driverApi.updateDriverCategory(driver.id, selectedCategoryId as number);
          toast.success('Driver category updated successfully');
          break;
      }
      handleActionDialogClose();
      await Promise.all([fetchDrivers(), fetchStats()]);
    } catch (err) {
      console.error('Error performing driver action:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to perform action');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer title="Drivers Management" description="Manage all drivers">
      <Box>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">Total Drivers</Typography>
              <Typography variant="h4">{stats?.total_drivers || 0}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">Active Drivers</Typography>
              <Typography variant="h4">{stats?.active_drivers || 0}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">Approved Drivers</Typography>
              <Typography variant="h4">{stats?.approved_drivers || 0}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">Pending Approval</Typography>
              <Typography variant="h4">{stats?.pending_drivers || 0}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="textSecondary">Suspended Drivers</Typography>
              <Typography variant="h4">{stats?.suspended_drivers || 0}</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Box mb={3} display="flex" gap={2}>
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DriverStatus | '')}
            sx={{ width: 200 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
          </TextField>

          <TextField
            label="Search"
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email"
            sx={{ width: 300 }}
          />
        </Box>

        {/* Drivers Table */}
        <Card>
          <Box sx={{ overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {driver.user.avatar_url && (
                          <Image
                            src={driver.user.avatar_url}
                            alt={driver.user.name}
                            width={32}
                            height={32}
                            style={{ borderRadius: '50%' }}
                          />
                        )}
                        {driver.user.name}
                      </Box>
                    </TableCell>
                    <TableCell>{driver.user.email}</TableCell>
                    <TableCell>{driver.user.phone_number}</TableCell>
                    <TableCell>
                      {driver.category?.name || (
                        <Chip label="No Category" size="small" color="default" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={driver.status}
                        color={statusColors[driver.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{driver.rating || 'N/A'}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {driver.status === 'pending' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleDriverAction(driver, 'approve')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleActionDialogOpen(driver, 'reject')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {driver.status === 'approved' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleActionDialogOpen(driver, 'suspend')}
                            >
                              Suspend
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleActionDialogOpen(driver, 'category')}
                            >
                              Update Category
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={drivers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        </Card>
      </Box>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onClose={handleActionDialogClose}>
        <DialogTitle>
          {actionDialog.action === 'reject' && 'Reject Driver'}
          {actionDialog.action === 'suspend' && 'Suspend Driver'}
          {actionDialog.action === 'category' && 'Update Driver Category'}
        </DialogTitle>
        <DialogContent>
          {(actionDialog.action === 'reject' || actionDialog.action === 'suspend') && (
            <TextField
              autoFocus
              margin="dense"
              label="Reason"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={actionDialog.reason}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setActionDialog(prev => ({ ...prev, reason: e.target.value }))}
            />
          )}
          {actionDialog.action === 'category' && (
            <TextField
              select
              margin="dense"
              label="Driver Category"
              fullWidth
              value={selectedCategoryId}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedCategoryId(Number(e.target.value))}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionDialogClose}>Cancel</Button>
          <Button 
            onClick={() => selectedDriver && handleDriverAction(selectedDriver, actionDialog.action)} 
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default DriversPage;
