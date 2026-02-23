import re

with open('resources/js/Pages/hr/employees/create.tsx', 'r') as f:
    content = f.read()

# Find the start of the form
form_start_match = re.search(r'<form\s+onSubmit=\{handleSubmit\}\s+className="space-y-6">', content)
if not form_start_match:
    print("Form start not found")
    exit(1)

# Find the end of the form
form_end_idx = content.find('</form>', form_start_match.start())
if form_end_idx == -1:
    print("Form end not found")
    exit(1)

form_end_idx += len('</form>')

# The replacement form content
replacement = """<form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Basic Information')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_id">{t('SN / Employee ID')}</Label>
                <Input
                  id="employee_id"
                  value={generatedEmployeeId}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="biometric_emp_id" required>{t('Employee Code')}</Label>
                <Input
                  id="biometric_emp_id"
                  required
                  value={formData.biometric_emp_id || ''}
                  onChange={(e) => handleChange('biometric_emp_id', e.target.value)}
                  className={errors.biometric_emp_id ? 'border-red-500' : ''}
                />
                {errors.biometric_emp_id && <p className="text-red-500 text-xs">{errors.biometric_emp_id}</p>}
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
      </form>"""

new_content = content[:form_start_match.start()] + replacement + content[form_end_idx:]

with open('resources/js/Pages/hr/employees/create.tsx', 'w') as f:
    f.write(new_content)

print("Successfully updated create.tsx")
