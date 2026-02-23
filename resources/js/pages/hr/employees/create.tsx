import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

export default function EmployeeCreate() {
  const { t } = useTranslation();
  const { branches, departments, designations, shifts, attendancePolicies, generatedEmployeeId } = usePage().props as any;

  // State
  const [formData, setFormData] = useState<Record<string, any>>({
    name: '',
    employee_id: '',
    biometric_emp_id: '',
    employee_status: 'active',
    gender: '',
    blood_group: '',
    department_id: '',
    designation_id: '',
    branch_id: '',
    salary: '',
    shift_id: '',
    attendance_policy_id: '',
    password: '',
    process: '',
    date_of_birth: '',
    date_of_joining: new Date().toISOString().split('T')[0],
    date_of_exit: '',
    personal_email: '',
    email: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    qualification: '',
    address_line_1: '',
    adhar_no: '',
    pan_no: '',
    uan: '',
    account_number: '',
    bank_identifier_code: '',
  });

  useEffect(() => {
    if (generatedEmployeeId && !formData.employee_id) {
      setFormData(prev => ({ 
        ...prev, 
        employee_id: generatedEmployeeId,
        biometric_emp_id: generatedEmployeeId
      }));
    }
  }, [generatedEmployeeId]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter designations based on selected department
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

    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        submitData.append(key, value);
      }
    });

    // Submit the form
    router.post(route('hr.employees.store'), submitData, {
      forceFormData: true,
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
    { title: t('Create Employee') }
  ];

  return (
    <PageTemplate
      title={t("Create Employee")}
      description={t("Fill in details to create a new employee record")}
      url="/hr/employees/create"
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
                  value={formData.employee_id || ''}
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
                <Label>{t('Gender')}</Label>
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

              <div className="space-y-2">
                <Label htmlFor="password">{t('Login Password')} </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('Leave blank to use default (12345678)')}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legal & Banking Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Legal & Banking')}</CardTitle>
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

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
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
            {isSubmitting ? t('Saving...') : t('Create Employee')}
          </Button>
        </div>
      </form>
    </PageTemplate>
  );
}