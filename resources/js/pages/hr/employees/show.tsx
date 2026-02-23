// pages/hr/employees/show.tsx
import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { hasPermission } from '@/utils/authorization';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Download, FileText, Calendar, Phone, Mail, MapPin, Building, Briefcase, CreditCard, User, Lock, Unlock, ArrowLeft, Check, X, History, Award, AlertTriangle, MessageSquare, Briefcase as PromotionIcon, MoveHorizontal, RotateCcw, GraduationCap } from 'lucide-react';
import { getImagePath } from '@/utils/helpers';

export default function EmployeeShow() {
  const { t } = useTranslation();
  const { auth, employee } = usePage().props as any;
  const permissions = auth?.permissions || [];
  const getInitials = useInitials();

  // State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic_info');

  const handleEdit = () => {
    router.get(route('hr.employees.edit', employee.id));
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting employee...'));

    router.delete(route('hr.employees.destroy', employee.id), {
      onSuccess: (page) => {
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(t(page.props.flash.success));
        } else if (page.props.flash.error) {
          toast.error(t(page.props.flash.error));
        }
        router.get(route('hr.employees.index'));
      },
      onError: (errors) => {
        toast.dismiss();
        if (typeof errors === 'string') {
          toast.error(t(errors));
        } else {
          toast.error(t('Failed to delete employee: {{errors}}', { errors: Object.values(errors).join(', ') }));
        }
      }
    });
  };

  const handleToggleStatus = () => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} employee...`);

    router.put(route('hr.employees.toggle-status', employee.id), {}, {
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
          toast.error(t('Failed to update employee status: {{errors}}', { errors: Object.values(errors).join(', ') }));
        }
      }
    });
  };

  const handleDeleteDocument = (documentId: number) => {
    toast.loading(t('Deleting document...'));

    router.delete(route('hr.employees.documents.destroy', [employee.id, documentId]), {
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
          toast.error(t('Failed to delete document: {{errors}}', { errors: Object.values(errors).join(', ') }));
        }
      }
    });
  };

  const handleDocumentVerification = (documentId: number, status: 'verified' | 'rejected') => {
    const action = status === 'verified' ? 'approve' : 'reject';
    toast.loading(t(`${status === 'verified' ? 'Approving' : 'Rejecting'} document...`));

    router.put(route(`hr.employees.documents.${action}`, [employee.id, documentId]), {}, {
      onSuccess: (page) => {
        toast.dismiss();
        if (page.props.flash?.success) {
          toast.success(t(page.props.flash.success));
        } else {
          toast.success(t(`Document ${status === 'verified' ? 'approved' : 'rejected'} successfully`));
        }
      },
      onError: (errors) => {
        toast.dismiss();
        const errorMessage = errors?.message || Object.values(errors)[0] || `Failed to ${action} document`;
        toast.error(t(errorMessage));
      }
    });
  };

  // Define page actions
  const pageActions = [
    {
      label: t('Back to Employees'),
      icon: <ArrowLeft className="h-4 w-4 mr-2" />,
      variant: 'outline',
      onClick: () => router.get(route('hr.employees.index'))
    }
  ];

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('HR Management'), href: route('hr.employees.index') },
    { title: t('Employees'), href: route('hr.employees.index') },
    { title: employee?.name || t('Employee Details') }
  ];

  // Prepare history events
  const historyEvents = [
    ...(employee.employee?.date_of_joining ? [{
      id: 'onboarding',
      type: 'onboarding',
      date: employee.employee.date_of_joining,
      title: t('Employee Joined'),
      description: t('Official onboarding and joining of the company'),
      icon: <User className="h-4 w-4" />,
      color: 'bg-blue-500'
    }] : []),
    ...(employee.awards || []).map((a: any) => ({
      id: `award-${a.id}`,
      type: 'award',
      date: a.award_date,
      title: t('Award Received'),
      description: a.gift ? `${t('Received')}: ${a.gift}` : t('Employee received an award'),
      icon: <Award className="h-4 w-4" />,
      color: 'bg-yellow-500'
    })),
    ...(employee.promotions || []).map((p: any) => ({
      id: `promotion-${p.id}`,
      type: 'promotion',
      date: p.promotion_date || p.effective_date,
      title: t('Promotion'),
      description: p.reason || t('Employee was promoted'),
      status: p.status,
      icon: <PromotionIcon className="h-4 w-4" />,
      color: 'bg-purple-500'
    })),
    ...(employee.transfers || []).map((tr: any) => ({
      id: `transfer-${tr.id}`,
      type: 'transfer',
      date: tr.transfer_date || tr.effective_date,
      title: t('Department Transfer'),
      description: tr.reason || t('Employee transferred to another department/branch'),
      status: tr.status,
      icon: <MoveHorizontal className="h-4 w-4" />,
      color: 'bg-indigo-500'
    })),
    ...(employee.warnings || []).map((w: any) => ({
      id: `warning-${w.id}`,
      type: 'warning',
      date: w.warning_date,
      title: t('Warning Issued'),
      description: w.subject || t('Formal warning issued'),
      status: w.status,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'bg-orange-500'
    })),
    ...(employee.complaints || []).map((c: any) => ({
      id: `complaint-${c.id}`,
      type: 'complaint',
      date: c.complaint_date,
      title: t('Complaint Recorded'),
      description: c.subject || t('A complaint was recorded'),
      status: c.status,
      icon: <MessageSquare className="h-4 w-4" />,
      color: 'bg-red-400'
    })),
    ...(employee.resignations || []).map((r: any) => ({
      id: `resignation-${r.id}`,
      type: 'resignation',
      date: r.resignation_date,
      title: t('Resignation Submitted'),
      description: r.reason || t('Employee submitted resignation'),
      status: r.status,
      icon: <FileText className="h-4 w-4" />,
      color: 'bg-red-500'
    })),
    ...(employee.terminations || []).map((term: any) => ({
      id: `termination-${term.id}`,
      type: 'termination',
      date: term.termination_date,
      title: t('Termination'),
      description: term.reason || t('Employee termination'),
      status: term.status,
      icon: <X className="h-4 w-4" />,
      color: 'bg-red-600'
    })),
    ...(employee.asset_assignments || []).map((ass: any) => ({
      id: `asset-checkout-${ass.id}`,
      type: 'asset_checkout',
      date: ass.checkout_date,
      title: t('Asset Assigned'),
      description: `${t('Asset')}: ${ass.asset?.name || t('Unknown')}`,
      icon: <Briefcase className="h-4 w-4" />,
      color: 'bg-blue-400'
    })),
    ...(employee.asset_assignments || []).filter((ass: any) => ass.checkin_date).map((ass: any) => ({
      id: `asset-checkin-${ass.id}`,
      type: 'asset_checkin',
      date: ass.checkin_date,
      title: t('Asset Returned'),
      description: `${t('Asset')}: ${ass.asset?.name || t('Unknown')}`,
      icon: <RotateCcw className="h-4 w-4" />,
      color: 'bg-slate-400'
    })),
    ...(employee.trainings || []).map((train: any) => ({
      id: `training-assigned-${train.id}`,
      type: 'training_assigned',
      date: train.assigned_date,
      title: t('Training Assigned'),
      description: `${t('Program')}: ${train.training_program?.title || t('Unknown')}`,
      status: train.status,
      icon: <GraduationCap className="h-4 w-4" />,
      color: 'bg-emerald-400'
    })),
    ...(employee.trainings || []).filter((train: any) => train.completion_date).map((train: any) => ({
      id: `training-completed-${train.id}`,
      type: 'training_completed',
      date: train.completion_date,
      title: t('Training Completed'),
      description: `${t('Program')}: ${train.training_program?.title || t('Unknown')}`,
      status: train.status,
      icon: <Check className="h-4 w-4" />,
      color: 'bg-emerald-600'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <PageTemplate
      title={employee?.name || t("Employee Details")}
      url={`/hr/employees/${employee?.id}`}
      actions={pageActions}
      breadcrumbs={breadcrumbs}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Employee Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="h-32 w-32 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mb-4 overflow-hidden">
                {employee.avatar ? (
                  <img src={getImagePath(employee.avatar)} alt={employee.name} className="h-full w-full object-cover" />
                ) : (
                  getInitials(employee.name)
                )}
              </div>
              <h2 className="text-xl font-bold mb-1">{employee.name}</h2>
              <p className="text-sm text-muted-foreground mb-2">{employee.employee?.designation?.name || '-'}</p>
              <div className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium mb-4 ${employee.employee?.employee_status === 'active'
                ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                : employee.employee?.employee_status === 'inactive'
                  ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                  : employee.employee?.employee_status === 'probation'
                    ? 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                    : employee.employee?.employee_status === 'terminated'
                      ? 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'
                      : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'
                }`}>
                {employee.employee?.employee_status === 'active' && t('Active')}
                {employee.employee?.employee_status === 'inactive' && t('Inactive')}
                {employee.employee?.employee_status === 'probation' && t('Probation')}
                {employee.employee?.employee_status === 'terminated' && t('Terminated')}
                {!employee.employee?.employee_status && '-'}
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{t('Employee ID')}: {employee.employee?.employee_id}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{employee.email}</span>
                </div>
                {employee.employee?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{employee.employee.phone}</span>
                  </div>
                )}
                {employee.employee?.date_of_birth && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{t('DOB')}: {window.appSettings?.formatDateTimeSimple(employee.employee.date_of_birth, false) || new Date(employee.employee.date_of_birth).toLocaleDateString()}</span>
                  </div>
                )}
                {employee.employee?.date_of_joining && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{t('Joined')}: {window.appSettings?.formatDateTimeSimple(employee.employee.date_of_joining, false) || new Date(employee.employee.date_of_joining).toLocaleDateString()}</span>
                  </div>
                )}
                {employee.employee?.department?.name && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{employee.employee.department.name}</span>
                  </div>
                )}
                {employee.employee?.branch?.name && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{employee.employee.branch.name}</span>
                  </div>
                )}
                {employee.employee?.employment_type && (
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{employee.employee.employment_type}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Details Tabs */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="basic_info">{t('Basic Info')}</TabsTrigger>
              <TabsTrigger value="employment">{t('Employment')}</TabsTrigger>
              <TabsTrigger value="history">{t('History')}</TabsTrigger>
              <TabsTrigger value="contact">{t('Contact')}</TabsTrigger>
              <TabsTrigger value="banking">{t('Banking')}</TabsTrigger>
              <TabsTrigger value="documents">{t('Documents')}</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic_info">
              <Card>
                <CardHeader>
                  <CardTitle>{t('Basic Information')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Full Name')}</h4>
                      <p>{employee.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Employee ID')}</h4>
                      <p>{employee.employee?.employee_id}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Email')}</h4>
                      <p>{employee.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Phone Number')}</h4>
                      <p>{employee.employee?.phone || '-'}</p>
                    </div>
                     <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Employee Code')}</h4>
                      <p>{employee.employee?.biometric_emp_id || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Date of Birth')}</h4>
                      <p>{employee.employee?.date_of_birth ? (window.appSettings?.formatDateTimeSimple(employee.employee.date_of_birth, false) || new Date(employee.employee.date_of_birth).toLocaleDateString()) : '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Gender')}</h4>
                      <p>{employee.employee?.gender ? t(employee.employee.gender.charAt(0).toUpperCase() + employee.employee.gender.slice(1)) : '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Employment Tab */}
            <TabsContent value="employment">
              <Card>
                <CardHeader>
                  <CardTitle>{t('Employment Details')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Branch')}</h4>
                      <p>{employee.employee?.branch?.name || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Department')}</h4>
                      <p>{employee.employee?.department?.name || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Designation')}</h4>
                      <p>{employee.employee?.designation?.name || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Date of Joining')}</h4>
                      <p>{employee.employee?.date_of_joining ? (window.appSettings?.formatDateTimeSimple(employee.employee.date_of_joining, false) || new Date(employee.employee.date_of_joining).toLocaleDateString()) : '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Employment Type')}</h4>
                      <p>{employee.employee?.employment_type || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Shift')}</h4>
                      <p>{employee.employee?.shift ? `${employee.employee.shift.name} (${employee.employee.shift.start_time} - ${employee.employee.shift.end_time})` : '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Attendance Policy')}</h4>
                      <p>{employee.employee?.attendance_policy?.name || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    {t('Employee History & Lifecycle')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {historyEvents.length > 0 ? (
                    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                      {historyEvents.map((event, index) => (
                        <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          {/* Icon */}
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${event.color} text-white z-10`}>
                            {event.icon}
                          </div>
                          {/* Content Card */}
                          <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <time className="text-xs font-bold text-muted-foreground">
                                {window.appSettings?.formatDateTimeSimple(event.date, false) || new Date(event.date).toLocaleDateString()}
                              </time>
                              {event.status && (
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  event.status === 'approved' || event.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {t(event.status.charAt(0).toUpperCase() + event.status.slice(1))}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-foreground mb-1">{event.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                          </Card>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <History className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                      <p className="text-muted-foreground">{t('No history records found for this employee')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>{t('Contact Information')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Address Line 1')}</h4>
                      <p>{employee.employee?.address_line_1 || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Address Line 2')}</h4>
                      <p>{employee.employee?.address_line_2 || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('City')}</h4>
                      <p>{employee.employee?.city || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('State/Province')}</h4>
                      <p>{employee.employee?.state || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Country')}</h4>
                      <p>{employee.employee?.country || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Postal/Zip Code')}</h4>
                      <p>{employee.employee?.postal_code || '-'}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">{t('Emergency Contact')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">{t('Name')}</h4>
                        <p>{employee.employee?.emergency_contact_name || '-'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">{t('Relationship')}</h4>
                        <p>{employee.employee?.emergency_contact_relationship || '-'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">{t('Phone Number')}</h4>
                        <p>{employee.employee?.emergency_contact_number || '-'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Banking Tab */}
            <TabsContent value="banking">
              <Card>
                <CardHeader>
                  <CardTitle>{t('Banking Information')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Bank Name')}</h4>
                      <p>{employee.employee?.bank_name || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Account Holder Name')}</h4>
                      <p>{employee.employee?.account_holder_name || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Account Number')}</h4>
                      <p>{employee.employee?.account_number || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Bank Identifier Code (BIC/SWIFT)')}</h4>
                      <p>{employee.employee?.bank_identifier_code || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Bank Branch')}</h4>
                      <p>{employee.employee?.bank_branch || '-'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">{t('Tax Payer ID')}</h4>
                      <p>{employee.employee?.tax_payer_id || '-'}</p>
                    </div>
                    {employee.employee?.base_salary && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">{t('Base Salary')}</h4>
                        <p>{employee.employee.base_salary}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>{t('Documents')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {employee.employee?.documents && employee.employee.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {employee.employee.documents.map((document: any) => (
                        <Card key={document.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center">
                                <FileText className="h-8 w-8 mr-3 text-primary" />
                                <div>
                                  <h4 className="font-medium">{document.document_type?.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {document.expiry_date ? `${t('Expires')}: ${window.appSettings?.formatDateTimeSimple(document.expiry_date, false) || new Date(document.expiry_date).toLocaleDateString()}` : t('No expiry date')}
                                  </p>
                                  <div className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium mt-2 ${document.verification_status === 'verified'
                                    ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                    : document.verification_status === 'rejected'
                                      ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                                      : 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                                    }`}>
                                    {document.verification_status === 'verified'
                                      ? t('Verified')
                                      : document.verification_status === 'rejected'
                                        ? t('Rejected')
                                        : t('Pending')}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" onClick={() => window.open(route('hr.employees.documents.download', [employee.id, document.id]), '_blank')}>
                                  <Download className="h-4 w-4" />
                                </Button>
                                {hasPermission(permissions, 'edit-employees') && (
                                  <Button variant="outline" size="sm" onClick={() => handleDeleteDocument(document.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                                {hasPermission(permissions, 'edit-employees') && document.verification_status === 'pending' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDocumentVerification(document.id, 'verified')}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDocumentVerification(document.id, 'rejected')}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('No documents found')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={employee?.name || ''}
        entityName="employee"
      />
    </PageTemplate>
  );
}