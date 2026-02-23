// pages/hr/employees/edit.tsx
import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Trash2, FileText, Download, Upload, Trash } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import MediaPicker from '@/components/MediaPicker';
import { getImagePath } from '@/utils/helpers';

export default function EmployeeEdit() {
  const { t } = useTranslation();
  const { employee, branches, departments, designations, documentTypes, shifts, attendancePolicies } = usePage().props as any;

  // State
  const [formData, setFormData] = useState<Record<string, any>>({
    name: employee.name || '',
    employee_id: employee.employee?.employee_id || '',
    biometric_emp_id: employee.employee?.biometric_emp_id || '',
    email: employee.email || '',
    personal_email: employee.employee?.personal_email || '',
    date_of_birth: employee.employee?.date_of_birth || '',
    gender: employee.employee?.gender || '',
    blood_group: employee.employee?.blood_group || '',
    qualification: employee.employee?.qualification || '',
    employee_status: employee.employee?.employee_status || 'active',
    department_id: employee.employee?.department_id ? employee.employee.department_id.toString() : '',
    designation_id: employee.employee?.designation_id ? employee.employee.designation_id.toString() : '',
    process: employee.employee?.process || '',
    date_of_joining: employee.employee?.date_of_joining || '',
    date_of_exit: employee.employee?.date_of_exit || '',
    phone: employee.employee?.phone || '',
    address_line_1: employee.employee?.address_line_1 || '',
    emergency_contact_name: employee.employee?.emergency_contact_name || '',
    emergency_contact_number: employee.employee?.emergency_contact_number || '',
    adhar_no: employee.employee?.adhar_no || '',
    pan_no: employee.employee?.pan_no || '',
    uan: employee.employee?.uan || '',
    account_number: employee.employee?.account_number || '',
    bank_identifier_code: employee.employee?.bank_identifier_code || '',
    branch_id: employee.employee?.branch_id ? employee.employee.branch_id.toString() : '',
    salary: employee.employee?.base_salary || '',
    shift_id: employee.employee?.shift_id ? employee.employee.shift_id.toString() : '',
    attendance_policy_id: employee.employee?.attendance_policy_id ? employee.employee.attendance_policy_id.toString() : '',
  });

  const [newDoc, setNewDoc] = useState({
    document_type_id: '',
    file: null as File | null,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUploadDocument = () => {
    if (!newDoc.document_type_id || !newDoc.file) {
      toast.error(t('Please select a document type and a file'));
      return;
    }

    const docData = new FormData();
    docData.append('document_type_id', newDoc.document_type_id);
    docData.append('file', newDoc.file);
    docData.append('notes', newDoc.notes);

    router.post(route('hr.employees.documents.store', employee.employee.id), docData, {
      forceFormData: true,
      onSuccess: () => {
        setNewDoc({
          document_type_id: '',
          file: null,
          notes: ''
        });
        toast.success(t('Document uploaded successfully'));
      },
      onError: (errors) => {
        Object.values(errors).forEach(error => toast.error(error as string));
      }
    });
  };

  const handleDeleteDocument = (docId: number) => {
    if (confirm(t('Are you sure you want to delete this document?'))) {
      router.delete(route('hr.employees.documents.destroy', { userId: employee.id, documentId: docId }), {
        onSuccess: () => toast.success(t('Document deleted successfully'))
      });
    }
  };

  const filteredDesignations = formData.department_id
    ? designations?.filter((desig: any) => String(desig.department_id) === String(formData.department_id)) || []
    : designations || [];

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }



    // Handle department change - reset designation
    if (name === 'department_id') {
      setFormData(prev => ({
        ...prev,
        department_id: value,
        designation_id: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create form data for submission
    const submitData = new FormData();

    // Add method override for PUT request
    submitData.append('_method', 'PUT');

    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        submitData.append(key, value);
      }
    });

    // Submit the form using POST with FormData directly
    router.post(route('hr.employees.update', employee.employee?.id), submitData, {
      onSuccess: (page: any) => {
        setIsSubmitting(false);
        const props = page.props as any;
        if (props.flash?.success) {
          toast.success(t(props.flash.success));
        }
        router.get(route('hr.employees.index'));
      },
      onError: (errors) => {
        setIsSubmitting(false);
        setErrors(errors);

        toast.error(t('Please correct the errors in the form'));
      }
    });
  };



  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('HR Management'), href: route('hr.employees.index') },
    { title: t('Employees'), href: route('hr.employees.index') },
    { title: t('Edit Employee') }
  ];

  return (
    <PageTemplate
      title={t("Edit Employee")}
      description={t("Correct or update details for this employee record")}
      url={`/hr/employees/${employee.id}/edit`}
      breadcrumbs={breadcrumbs}
      actions={[
        {
          label: t('Back to Employees'),
          icon: <ArrowLeft className="h-4 w-4 mr-2" />,
          variant: 'outline',
          onClick: () => router.get(route('hr.employees.index'))
        }
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Basic Information')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(errors).length > 0 && (
              <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800">{t('Please correct the following errors:')}</p>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {Object.entries(errors).map(([key, message]) => (
                    <li key={key}>{message}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">{t('SN / Employee ID')}</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  readOnly
                  className="bg-muted font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="biometric_emp_id">{t('Employee Code')}</Label>
                <Input
                  id="biometric_emp_id"
                  value={formData.employee_id || ''}
                  readOnly
                  className="bg-muted font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" required>{t('Full Name')} </Label>
                <Input
                  id="name"
                  value={formData.name}
                  required
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">{t('Date of Birth')}</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  className={errors.date_of_birth ? 'border-red-500' : ''}
                />
                {errors.date_of_birth && <p className="text-red-500 text-xs">{errors.date_of_birth}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">{t('Gender')}</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleChange('gender', value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="gender-male" />
                    <Label htmlFor="gender-male">{t('Male')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="gender-female" />
                    <Label htmlFor="gender-female">{t('Female')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="gender-other" />
                    <Label htmlFor="gender-other">{t('Other')}</Label>
                  </div>
                </RadioGroup>
                {errors.gender && <p className="text-red-500 text-xs">{errors.gender}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="blood_group">{t('Blood Group')}</Label>
                <Input
                  id="blood_group"
                  value={formData.blood_group}
                  onChange={(e) => handleChange('blood_group', e.target.value)}
                  className={errors.blood_group ? 'border-red-500' : ''}
                />
                {errors.blood_group && <p className="text-red-500 text-xs">{errors.blood_group}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification">{t('Qualification')}</Label>
                <Input
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) => handleChange('qualification', e.target.value)}
                  className={errors.qualification ? 'border-red-500' : ''}
                />
                {errors.qualification && <p className="text-red-500 text-xs">{errors.qualification}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Employment Details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch_id" required>{t('Branch')} </Label>
                <Select
                  value={formData.branch_id}
                  onValueChange={(value) => handleChange('branch_id', value)}
                >
                  <SelectTrigger className={errors.branch_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('Select Branch')} />
                  </SelectTrigger>
                  <SelectContent searchable={true}>
                    {branches?.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.branch_id && <p className="text-red-500 text-xs">{errors.branch_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_status" required>{t('Status')}</Label>
                <Select
                  value={formData.employee_status}
                  onValueChange={(value) => handleChange('employee_status', value)}
                >
                  <SelectTrigger className={errors.employee_status ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('Active')}</SelectItem>
                    <SelectItem value="inactive">{t('Inactive')}</SelectItem>
                    <SelectItem value="probation">{t('Probation')}</SelectItem>
                    <SelectItem value="terminated">{t('Terminated')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employee_status && <p className="text-red-500 text-xs">{errors.employee_status}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department_id" required>{t('Department')} </Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => handleChange('department_id', value)}
                >
                  <SelectTrigger className={errors.department_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('Select Department')} />
                  </SelectTrigger>
                  <SelectContent searchable={true}>
                    {departments?.map((department: any) => (
                      <SelectItem key={department.id} value={department.id.toString()}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department_id && <p className="text-red-500 text-xs">{errors.department_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation_id" required>{t('Position')} </Label>
                <Select
                  value={formData.designation_id}
                  onValueChange={(value) => handleChange('designation_id', value)}
                  disabled={!formData.department_id}
                >
                  <SelectTrigger className={errors.designation_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={formData.department_id ? t('Select Position') : t('Select Department First')} />
                  </SelectTrigger>
                  <SelectContent searchable={true}>
                    {filteredDesignations?.map((designation: any) => (
                      <SelectItem key={designation.id} value={designation.id.toString()}>
                        {designation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.designation_id && <p className="text-red-500 text-xs">{errors.designation_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="process">{t('Process (Client)')} </Label>
                <Input
                  id="process"
                  value={formData.process}
                  onChange={(e) => handleChange('process', e.target.value)}
                  className={errors.process ? 'border-red-500' : ''}
                />
                {errors.process && <p className="text-red-500 text-xs">{errors.process}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">{t('Salary')} </Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleChange('salary', e.target.value)}
                  className={errors.salary ? 'border-red-500' : ''}
                />
                {errors.salary && <p className="text-red-500 text-xs">{errors.salary}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift_id">{t('Shift')} </Label>
                <Select
                  value={formData.shift_id}
                  onValueChange={(value) => handleChange('shift_id', value)}
                >
                  <SelectTrigger className={errors.shift_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('Select Shift')} />
                  </SelectTrigger>
                  <SelectContent searchable={true}>
                    {shifts?.map((shift: any) => (
                      <SelectItem key={shift.id} value={shift.id.toString()}>
                        {shift.name} ({shift.start_time} - {shift.end_time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.shift_id && <p className="text-red-500 text-xs">{errors.shift_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendance_policy_id">{t('Attendance Policy')} </Label>
                <Select
                  value={formData.attendance_policy_id}
                  onValueChange={(value) => handleChange('attendance_policy_id', value)}
                >
                  <SelectTrigger className={errors.attendance_policy_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('Select Attendance Policy')} />
                  </SelectTrigger>
                  <SelectContent searchable={true}>
                    {attendancePolicies?.map((policy: any) => (
                      <SelectItem key={policy.id} value={policy.id.toString()}>
                        {policy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.attendance_policy_id && <p className="text-red-500 text-xs">{errors.attendance_policy_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_joining" required>{t('Date of Joining')} </Label>
                <Input
                  id="date_of_joining"
                  type="date"
                  required
                  value={formData.date_of_joining}
                  onChange={(e) => handleChange('date_of_joining', e.target.value)}
                  className={errors.date_of_joining ? 'border-red-500' : ''}
                />
                {errors.date_of_joining && <p className="text-red-500 text-xs">{errors.date_of_joining}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_exit">{t('Date of Exit')} </Label>
                <Input
                  id="date_of_exit"
                  type="date"
                  value={formData.date_of_exit}
                  onChange={(e) => handleChange('date_of_exit', e.target.value)}
                  className={errors.date_of_exit ? 'border-red-500' : ''}
                />
                {errors.date_of_exit && <p className="text-red-500 text-xs">{errors.date_of_exit}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Contact Information')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" required>{t('Email Id Official')} </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="personal_email">{t('Email Id Personal')} </Label>
                <Input
                  id="personal_email"
                  type="email"
                  value={formData.personal_email}
                  onChange={(e) => handleChange('personal_email', e.target.value)}
                  className={errors.personal_email ? 'border-red-500' : ''}
                />
                {errors.personal_email && <p className="text-red-500 text-xs">{errors.personal_email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('Personal no')} </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line_1">{t('Address')} </Label>
                <Input
                  id="address_line_1"
                  value={formData.address_line_1}
                  onChange={(e) => handleChange('address_line_1', e.target.value)}
                  className={errors.address_line_1 ? 'border-red-500' : ''}
                />
                {errors.address_line_1 && <p className="text-red-500 text-xs">{errors.address_line_1}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">{t('Emergency contact name')} </Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                  className={errors.emergency_contact_name ? 'border-red-500' : ''}
                />
                {errors.emergency_contact_name && <p className="text-red-500 text-xs">{errors.emergency_contact_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_number">{t('Emergency contact number')} </Label>
                <Input
                  id="emergency_contact_number"
                  value={formData.emergency_contact_number}
                  onChange={(e) => handleChange('emergency_contact_number', e.target.value)}
                  className={errors.emergency_contact_number ? 'border-red-500' : ''}
                />
                {errors.emergency_contact_number && <p className="text-red-500 text-xs">{errors.emergency_contact_number}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Banking Information')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adhar_no">{t('Adhar no')} </Label>
                <Input
                  id="adhar_no"
                  value={formData.adhar_no}
                  onChange={(e) => handleChange('adhar_no', e.target.value)}
                  className={errors.adhar_no ? 'border-red-500' : ''}
                />
                {errors.adhar_no && <p className="text-red-500 text-xs">{errors.adhar_no}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pan_no">{t('Pan no')} </Label>
                <Input
                  id="pan_no"
                  value={formData.pan_no}
                  onChange={(e) => handleChange('pan_no', e.target.value)}
                  className={errors.pan_no ? 'border-red-500' : ''}
                />
                {errors.pan_no && <p className="text-red-500 text-xs">{errors.pan_no}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="uan">{t('UAN')} </Label>
                <Input
                  id="uan"
                  value={formData.uan}
                  onChange={(e) => handleChange('uan', e.target.value)}
                  className={errors.uan ? 'border-red-500' : ''}
                />
                {errors.uan && <p className="text-red-500 text-xs">{errors.uan}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_number">{t('Account')} </Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => handleChange('account_number', e.target.value)}
                  className={errors.account_number ? 'border-red-500' : ''}
                />
                {errors.account_number && <p className="text-red-500 text-xs">{errors.account_number}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_identifier_code">{t('IFSC')} </Label>
                <Input
                  id="bank_identifier_code"
                  value={formData.bank_identifier_code}
                  onChange={(e) => handleChange('bank_identifier_code', e.target.value)}
                  className={errors.bank_identifier_code ? 'border-red-500' : ''}
                />
                {errors.bank_identifier_code && <p className="text-red-500 text-xs">{errors.bank_identifier_code}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Document Management')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* List of existing documents */}
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Document Type')}</TableHead>
                    <TableHead>{t('File')}</TableHead>
                    <TableHead>{t('Description')}</TableHead>
                    <TableHead>{t('Status')}</TableHead>
                    <TableHead className="text-right">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employee.employee?.documents?.length > 0 ? (
                    employee.employee.documents.map((doc: any) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium whitespace-nowrap">{doc.document_type?.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs truncate max-w-[150px]">
                              {doc.file_path.split('/').pop()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">{doc.notes || '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-[10px] rounded-full capitalize ${
                            doc.verification_status === 'verified' ? 'bg-green-100 text-green-700' :
                            doc.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {t(doc.verification_status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              title={t('Download')}
                              onClick={() => window.open(route('hr.employees.documents.download', { userId: employee.id, documentId: doc.id }), '_blank')}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              title={t('Delete')}
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        {t('No documents uploaded yet')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Form to add new document */}
            <div className="pt-6 border-t mt-4">
              <div className="bg-muted/30 p-6 rounded-xl border border-dashed border-muted-foreground/20">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Upload className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{t('Upload New Document')}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                  <div className="space-y-2">
                    <Label htmlFor="new_document_type" className="text-sm font-medium">{t('Document Type')}</Label>
                    <Select
                      value={newDoc.document_type_id}
                      onValueChange={(value) => setNewDoc(prev => ({ ...prev, document_type_id: value }))}
                    >
                      <SelectTrigger id="new_document_type" className="bg-background border-muted-foreground/20 focus:ring-primary/20">
                        <SelectValue placeholder={t('Select Type')} />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes?.map((type: any) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_document_file" className="text-sm font-medium">{t('Select File')}</Label>
                    <div className="relative cursor-pointer group">
                      <Input
                        id="new_document_file"
                        type="file"
                        className="hidden"
                        onChange={(e) => setNewDoc(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                      />
                      <Label 
                        htmlFor="new_document_file" 
                        className="flex items-center justify-center space-x-2 w-full h-10 px-3 py-2 text-sm border border-muted-foreground/20 rounded-md bg-background hover:bg-muted/50 transition-colors cursor-pointer group-hover:border-primary/50"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[180px]">
                          {newDoc.file ? newDoc.file.name : t('Choose file...')}
                        </span>
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2 lg:col-span-1 md:col-span-2">
                    <Label htmlFor="new_document_notes" className="text-sm font-medium">{t('Description / Notes')}</Label>
                    <Input
                      id="new_document_notes"
                      placeholder={t('Add a short description...')}
                      value={newDoc.notes}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, notes: e.target.value }))}
                      className="bg-background border-muted-foreground/20 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button 
                    type="button" 
                    onClick={handleUploadDocument}
                    className="shadow-sm hover:shadow-md transition-all px-6"
                    disabled={!newDoc.document_type_id || !newDoc.file}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t('Upload Document')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.get(route('hr.employees.index'))}
          >
            {t('Cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('Saving...') : t('Save')}
          </Button>
        </div>
      </form>
    </PageTemplate>
  );
}