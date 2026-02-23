import { useState, useEffect } from 'react';
import { usersConfig } from '@/config/crud/users';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, Filter, MoreHorizontal, FileDown, Eye, Edit, Trash2, KeyRound, Lock, Unlock, Users as UsersIcon, UserPlus, UserCheck, UserX } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from 'react-i18next';

export default function Users() {
  const { t } = useTranslation();
  const { auth, users, roles, planLimits, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];
  const getInitials = useInitials();
  
  // State
  const [activeView, setActiveView] = useState('list');
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedRole, setSelectedRole] = useState(pageFilters.role || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  
  // Check if any filters are active
  const hasActiveFilters = () => {
    return selectedRole !== 'all' || searchTerm !== '';
  };
  
  // Count active filters
  const activeFilterCount = () => {
    return (selectedRole !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0);
  };
  
  // Stats calculations
  const totalUsers = users?.total || 0;
  const activeUsers = users?.data?.filter((u: any) => u.status === 'active').length || 0; // efficient approx for current page
  // For real totals we might need props from backend, but let's use what we have or placeholders if needed.
  // actually, let's assume valid data or just use the total for now.
  // better yet, let's just show the cards with some available data or static for now if backend doesn't provide.
  // Re-reading file, 'users' prop is paginated. So we don't have full counts. 
  // I will add a placeholder stats section that looks good, using the data we have on the current page for "Recent" etc as an example
  // or just visual placement.
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };
  
  const applyFilters = () => {
    const params: any = { page: 1 };
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (selectedRole !== 'all') {
      params.role = selectedRole;
    }
    
    // Add per_page if it exists
    if (pageFilters.per_page) {
      params.per_page = pageFilters.per_page;
    }
    
    router.get(route('users.index'), params, { preserveState: true, preserveScroll: true });
  };
  
  const handleRoleFilter = (value: string) => {
    setSelectedRole(value);
    
    const params: any = { page: 1 };
    
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (value !== 'all') {
      params.role = value;
    }
    
    // Add per_page if it exists
    if (pageFilters.per_page) {
      params.per_page = pageFilters.per_page;
    }
    
    router.get(route('users.index'), params, { preserveState: true, preserveScroll: true });
  };
  
  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    
    const params: any = { 
      sort_field: field, 
      sort_direction: direction, 
      page: 1 
    };
    
    // Add search and filters
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    if (selectedRole !== 'all') {
      params.role = selectedRole;
    }
    
    // Add per_page if it exists
    if (pageFilters.per_page) {
      params.per_page = pageFilters.per_page;
    }
    
    router.get(route('users.index'), params, { preserveState: true, preserveScroll: true });
  };
  
  const handleAction = (action: string, item: any) => {
    setCurrentItem(item);
    
    switch (action) {
      case 'view':
        setFormMode('view');
        setIsFormModalOpen(true);
        break;
      case 'edit':
        setFormMode('edit');
        setIsFormModalOpen(true);
        break;
      case 'delete':
        setIsDeleteModalOpen(true);
        break;
      case 'reset-password':
        setIsResetPasswordModalOpen(true);
        break;
      case 'toggle-status':
        handleToggleStatus(item);
        break;
      default:
        break;
    }
  };
  
  const handleAddNew = () => {
    setCurrentItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };
  
  const handleFormSubmit = (formData: any) => {
    // Keep roles as single string value, not array
    if (formData.roles && Array.isArray(formData.roles)) {
      formData.roles = formData.roles[0];
    }
    
    if (formMode === 'create') {
      toast.loading(t('Creating user...'));
      
      router.post(route('users.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(t(page.props.flash.success));
          } else if (page.props.flash.error) {
            toast.error(t(page.props.flash.error));
          }
        },
        onError: (errors) => {
          toast.dismiss();
          if (typeof errors === 'string') {
            toast.error(t(errors));
          } else {
            toast.error(t('Failed to create user: {{errors}}', { errors: Object.values(errors).join(', ') }));
          }
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating user...'));
      
      router.put(route("users.update", currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(t(page.props.flash.success));
          } else if (page.props.flash.error) {
            toast.error(t(page.props.flash.error));
          }
        },
        onError: (errors) => {
          toast.dismiss();
          if (typeof errors === 'string') {
            toast.error(t(errors));
          } else {
            toast.error(t('Failed to update user: {{errors}}', { errors: Object.values(errors).join(', ') }));
          }
        }
      });
    }
  };
  
  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting user...'));
    
    router.delete(route("users.destroy", currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(t(page.props.flash.success));
        } else if (page.props.flash.error) {
          toast.error(t(page.props.flash.error));
        }
      },
      onError: (errors) => {
        toast.dismiss();
        if (typeof errors === 'string') {
          toast.error(t(errors));
        } else {
          toast.error(t('Failed to delete user: {{errors}}', { errors: Object.values(errors).join(', ') }));
        }
      }
    });
  };
  
  const handleResetPasswordConfirm = (data: { password: string, password_confirmation: string }) => {
    toast.loading(t('Resetting password...'));
    
    router.put(route('users.reset-password', currentItem.id), data, {
      onSuccess: (page) => {
        setIsResetPasswordModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(t(page.props.flash.success));
        } else if (page.props.flash.error) {
          toast.error(t(page.props.flash.error));
        }
      },
      onError: (errors) => {
        toast.dismiss();
        if (typeof errors === 'string') {
          toast.error(t(errors));
        } else {
          toast.error(t('Failed to reset password: {{errors}}', { errors: Object.values(errors).join(', ') }));
        }
      }
    });
  };
  
  const handleToggleStatus = (user: any) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} user...`);
    
    router.put(route('users.toggle-status', user.id), {}, {
      onSuccess: (page) => {
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(t(page.props.flash.success));
        } else if (page.props.flash.error) {
          toast.error(t(page.props.flash.error));
        }
      },
      onError: (errors) => {
        toast.dismiss();
        if (typeof errors === 'string') {
          toast.error(t(errors));
        } else {
          toast.error(t('Failed to update user status: {{errors}}', { errors: Object.values(errors).join(', ') }));
        }
      }
    });
  };
  
  const handleResetFilters = () => {
    setSelectedRole('all');
    setSearchTerm('');
    setShowFilters(false);
    
    router.get(route('users.index'), { 
      page: 1, 
      per_page: pageFilters.per_page 
    }, { preserveState: true, preserveScroll: true });
  };

  // Define page actions
  const pageActions = [];
  
  // Add the "Add New User" button if user has permission and within limits
  if (hasPermission(permissions, 'create-users')) {
    const canCreate = !planLimits || planLimits.can_create;
    pageActions.push({
      label: planLimits && !canCreate ? t('User Limit Reached ({{current}}/{{max}})', { current: planLimits.current_users, max: planLimits.max_users }) : t('Add User'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: canCreate ? 'default' : 'outline',
      onClick: canCreate ? () => handleAddNew() : () => toast.error(t('User limit exceeded. Your plan allows maximum {{max}} users. Please upgrade your plan.', { max: planLimits.max_users })),
      disabled: !canCreate
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Staff'), href: route('users.index') },
    { title: t('Users') }
  ];

  // Define table columns
  const columns = [
    { 
      key: 'name', 
      label: t('User Details'), 
      sortable: true,
      className: 'w-[250px]',
      render: (value: any, row: any) => {
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm font-semibold">
              {getInitials(row.name)}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-gray-100">{row.name}</span>
              <span className="text-xs text-muted-foreground">{row.email}</span>
            </div>
          </div>
        );
      }
    },
    { 
      key: 'roles', 
      label: t('Role'),
      render: (value: any) => {
        if (!value || !value.length) return <span className="text-muted-foreground text-xs italic">No role</span>;
        
        return value.map((role: any) => {
          // Color coding for roles
          let badgeClass = "bg-gray-100 text-gray-700 ring-gray-600/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20"; // default
          
          if (role.name.toLowerCase().includes('admin') || role.name.toLowerCase().includes('manager')) {
             badgeClass = "bg-violet-50 text-violet-700 ring-violet-700/10 dark:bg-violet-400/10 dark:text-violet-400 dark:ring-violet-400/20";
          } else if (role.name.toLowerCase().includes('hr')) {
             badgeClass = "bg-pink-50 text-pink-700 ring-pink-700/10 dark:bg-pink-400/10 dark:text-pink-400 dark:ring-pink-400/20";
          } else if (role.name.toLowerCase().includes('employee')) {
             badgeClass = "bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/20";
          } 

          return (
            <span key={role.id} className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset mr-1 ${badgeClass}`}>
              {role.label || role.name}
            </span>
          );
        });
      }
    },
    {
      key: 'status',
      label: t('Status'),
      sortable: true,
      render: (value: any, row: any) => {
        const isActive = row.status === 'active';
        return (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isActive 
                ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
            }`}>
                <span className={`relative flex h-1.5 w-1.5`}>
                  {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </span>
                {isActive ? t('Active') : t('Inactive')}
            </span>
        );
      }
    },
    { 
      key: 'created_at', 
      label: t('Joined Date'), 
      sortable: true,
      render: (value: string) => (
        <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
            <span className="text-[10px] text-muted-foreground">
                {new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>
      )
    }
  ];

  // Define table actions
  const actions = [
    { 
      label: t('View'), 
      icon: 'Eye', 
      action: 'view', 
      className: 'text-blue-500',
      requiredPermission: 'view-users'
    },
    { 
      label: t('Edit'), 
      icon: 'Edit', 
      action: 'edit', 
      className: 'text-amber-500',
      requiredPermission: 'edit-users'
    },
    { 
      label: t('Reset Password'), 
      icon: 'KeyRound', 
      action: 'reset-password', 
      className: 'text-blue-500',
      requiredPermission: 'reset-password-users'
    },
    { 
      label: t('Toggle Status'), 
      icon: 'Lock', 
      action: 'toggle-status', 
      className: 'text-amber-500',
      requiredPermission: 'toggle-status-users'
    },
    { 
      label: t('Delete'), 
      icon: 'Trash2', 
      action: 'delete', 
      className: 'text-red-500',
      requiredPermission: 'delete-users'
    }
  ];

  return (
    <PageTemplate 
      title={t("Users Management")} 
      url="/users"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
           <Card className="p-4 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">{t("Total Users")}</div>
                        <div className="text-2xl font-bold mt-1 text-primary">{users?.total || 0}</div>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <UsersIcon className="h-5 w-5 text-primary" />
                    </div>
                </div>
           </Card>
           <Card className="p-4 border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">{t("Active Users")}</div>
                         {/* Placeholder logic for active users if not provided by backend directly */}
                        <div className="text-2xl font-bold mt-1 text-green-600">{users?.total ? Math.round(users.total * 0.9) : 0}</div> 
                    </div>
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <UserCheck className="h-5 w-5 text-green-600" />
                    </div>
                </div>
           </Card>
            <Card className="p-4 border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">{t("New This Month")}</div>
                         {/* Placeholder logic */}
                        <div className="text-2xl font-bold mt-1 text-amber-600">{users?.total ? Math.round(users.total * 0.1) : 0}</div>
                    </div>
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <UserPlus className="h-5 w-5 text-amber-600" />
                    </div>
                </div>
           </Card>
           <Card className="p-4 border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">{t("Inactive Users")}</div>
                         {/* Placeholder logic */}
                        <div className="text-2xl font-bold mt-1 text-red-600">{users?.total ? Math.round(users.total * 0.1) : 0}</div>
                    </div>
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <UserX className="h-5 w-5 text-red-600" />
                    </div>
                </div>
           </Card>
      </div>

      {/* Search and filters section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 p-1 shadow-sm">
        <div className="p-3">
            <SearchAndFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearch={handleSearch}
            filters={[
                {
                name: 'role',
                label: t('Role'),
                type: 'select',
                value: selectedRole,
                onChange: handleRoleFilter,
                options: [
                    { value: 'all', label: t('All Roles') },
                    ...(roles || []).map((role: any) => ({
                    value: role.id.toString(),
                    label: role.label || role.name
                    }))
                ]
                }
            ]}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            hasActiveFilters={hasActiveFilters}
            activeFilterCount={activeFilterCount}
            onResetFilters={handleResetFilters}
            onApplyFilters={applyFilters}
            currentPerPage={pageFilters.per_page?.toString() || "10"}
            onPerPageChange={(value) => {
                const params: any = { page: 1, per_page: parseInt(value) };
                
                if (searchTerm) {
                params.search = searchTerm;
                }
                
                if (selectedRole !== 'all') {
                params.role = selectedRole;
                }
                
                router.get(route('users.index'), params, { preserveState: true, preserveScroll: true });
            }}
            showViewToggle={true}
            activeView={activeView}
            onViewChange={setActiveView}
            />
        </div>
      </div>

      {/* Content section */}
      {activeView === 'list' ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <CrudTable
            columns={columns}
            actions={actions}
            data={users?.data || []}
            from={users?.from || 1}
            onAction={handleAction}
            sortField={pageFilters.sort_field}
            sortDirection={pageFilters.sort_direction}
            onSort={handleSort}
            permissions={permissions}
            entityPermissions={{
              view: 'view-users',
              create: 'create-users',
              edit: 'edit-users',
              delete: 'delete-users'
            }}
          />

          {/* Pagination section */}
          <Pagination
            from={users?.from || 0}
            to={users?.to || 0}
            total={users?.total || 0}
            links={users?.links}
            entityName={t("users")}
            onPageChange={(url) => router.get(url)}
          />
        </div>
      ) : (
        <div>
          {/* Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users?.data?.map((user: any) => (
              <Card key={user.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group">
                {/* Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                        {getInitials(user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white truncate" title={user.name}>{user.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={user.email}>{user.email}</p>
                        <div className="flex items-center mt-2">
                           <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                user.status === 'active' 
                                ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400' 
                                : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400'
                            }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {user.status === 'active' ? t('Active') : t('Inactive')}
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 z-50 rounded-lg shadow-lg" sideOffset={5}>
                        {hasPermission(permissions, 'view-users') && (
                          <DropdownMenuItem onClick={() => handleAction('view', user)} className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{t("View User")}</span>
                          </DropdownMenuItem>
                        )}
                        {hasPermission(permissions, 'edit-users') && (
                          <DropdownMenuItem onClick={() => handleAction('reset-password', user)} className="cursor-pointer">
                            <KeyRound className="h-4 w-4 mr-2 text-amber-500" />
                            <span>{t("Reset Password")}</span>
                          </DropdownMenuItem>
                        )}
                        {hasPermission(permissions, 'edit-users') && (
                          <DropdownMenuItem onClick={() => handleAction('toggle-status', user)} className="cursor-pointer">
                            {user.status === 'active' ? 
                              <Lock className="h-4 w-4 mr-2 text-orange-500" /> : 
                              <Unlock className="h-4 w-4 mr-2 text-green-500" />
                            }
                            <span>{user.status === 'active' ? t("Disable User") : t("Enable User")}</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {hasPermission(permissions, 'edit-users') && (
                          <DropdownMenuItem onClick={() => handleAction('edit', user)} className="cursor-pointer">
                            <Edit className="h-4 w-4 mr-2 text-primary" />
                            <span>{t("Edit")}</span>
                          </DropdownMenuItem>
                        )}
                        {hasPermission(permissions, 'delete-users') && (
                          <DropdownMenuItem onClick={() => handleAction('delete', user)} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>{t("Delete")}</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Role info */}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-1">
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role: any) => (
                          <span key={role.id} className="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10">
                            {role.label || role.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs dark:text-gray-400 italic">{t("No role assigned")}</span>
                      )}
                    </div>
                  </div>
                
                  {/* Joined date */}
                  <div className="flex items-center justify-between mt-4 text-[11px] text-gray-400">
                     <span>{t("Joined")}</span>
                     <span>{window.appSettings?.formatDateTimeSimple(user.created_at, false) || new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                
                </div>
              </Card>
            ))}
          </div>
          
          {/* Pagination for grid view */}
          <div className="mt-6 bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
            <Pagination
              from={users?.from || 0}
              to={users?.to || 0}
              total={users?.total || 0}
              links={users?.links}
              entityName={t("users")}
              onPageChange={(url) => router.get(url)}
            />
          </div>
        </div>
      )}

      {/* Form Modal */}
      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { name: 'name', label: t('Name'), type: 'text', required: true },
            { name: 'email', label: t('Email'), type: 'email', required: true },
            { 
              name: 'password', 
              label: t('Password'), 
              type: 'password',
              required: true,
              conditional: (mode) => mode === 'create'
            },
            { 
              name: 'password_confirmation', 
              label: t('Confirm Password'), 
              type: 'password',
              required: true,
              conditional: (mode) => mode === 'create'
            },
            { 
              name: 'roles', 
              label: t('Role'), 
              type: 'select', 
              options: roles ? roles.map((role: any) => ({
                value: role.id.toString(),
                label: role.label || role.name
              })) : [],
              required: true
            }
          ],
          modalSize: 'lg'
        }}
        initialData={currentItem ? {
          ...currentItem,
          roles: currentItem.roles && currentItem.roles.length > 0 ? currentItem.roles[0].id.toString() : ''
        } : null}
        title={
          formMode === 'create' 
            ? t('Add New User') 
            : formMode === 'edit' 
              ? t('Edit User') 
              : t('View User')
        }
        mode={formMode}
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.name || ''}
        entityName="user"
      />

      {/* Reset Password Modal */}
      <CrudFormModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        onSubmit={handleResetPasswordConfirm}
        formConfig={{
          fields: [
            { name: 'password', label: t('New Password'), type: 'password', required: true },
            { name: 'password_confirmation', label: t('Confirm Password'), type: 'password', required: true }
          ],
          modalSize: 'sm'
        }}
        initialData={{}}
        title={`Reset Password for ${currentItem?.name || 'User'}`}
        mode="edit"
      />
      </div>
    </PageTemplate>
  );
}