import { PageTemplate } from '@/components/page-template';
import { usePage, router, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Briefcase, MapPin, Clock, DollarSign, Calendar, Phone, Mail, Building, ExternalLink, GraduationCap, Award, Users, FileText, Send } from 'lucide-react';
import { getImagePath } from '@/utils/helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function CandidateShow() {
  const { t } = useTranslation();
  const { candidate, offerTemplates } = usePage().props as any;

  const { data, setData, post, processing, errors, reset } = useForm({
    offer_template_id: '',
    salary: candidate.final_salary || candidate.expected_salary || candidate.current_salary || '',
    start_date: '',
    expiration_date: '',
    message: ''
  });

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('hr.recruitment.candidates.send-offer', candidate.id), {
      onSuccess: () => {
        toast.success(t('Offer letter sent successfully'));
        reset();
      },
      onError: () => {
        toast.error(t('Please check the form for errors'));
      }
    });
  };

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Recruitment') },
    { title: t('Candidates'), href: route('hr.recruitment.candidates.index') },
    { title: `${candidate.first_name} ${candidate.last_name}` }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'Screening': return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20';
      case 'Interview': return 'bg-purple-50 text-purple-700 ring-purple-600/20';
      case 'Offer': return 'bg-orange-50 text-orange-700 ring-orange-600/20';
      case 'Hired': return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'Rejected': return 'bg-red-50 text-red-700 ring-red-600/10';
      default: return 'bg-gray-50 text-gray-600 ring-gray-500/10';
    }
  };

  return (
    <PageTemplate
      title={t('Candidate Details')}
      breadcrumbs={breadcrumbs}
      description={t('View detailed information about the candidate')}
      url={route('hr.recruitment.candidates.show', candidate.id)}
      actions={[
        {
          label: t('Back to Candidates'),
          icon: <ArrowLeft className="h-4 w-4 mr-2" />,
          variant: 'outline',
          onClick: () => router.get(route('hr.recruitment.candidates.index'))
        }
      ]}
    >
      <div className="space-y-6">
        {/* Candidate Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {candidate.first_name} {candidate.last_name}
                  </h1>
                  <p className="text-base text-gray-600 mt-1">{candidate.current_position || t('Job Applicant')}</p>
                  <p className="text-sm text-gray-500">{candidate.current_company}</p>
                  {candidate.rating && (
                    <div className="flex items-center mt-2">
                      <span className="text-sm font-medium text-gray-700 mr-2">{t('Rating')}:</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-lg ${i < candidate.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ring-1 ring-inset ${getStatusColor(candidate.status)}`}>
                  {t(candidate.status)}
                </Badge>
                <p className="text-sm text-gray-500 mt-2">
                  {t('Applied on')} {new Date(candidate.application_date).toLocaleDateString()}
                </p>
                {candidate.is_archive && (
                  <Badge variant="secondary" className="mt-2">{t('Archived')}</Badge>
                )}
                {candidate.is_employee && (
                  <Badge variant="outline" className="mt-2 ml-2">{t('Employee')}</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border rounded-lg p-1">
            <TabsTrigger value="overview">{t('Overview')}</TabsTrigger>
            {['Offer', 'Offered'].includes(candidate.status) && (
              <TabsTrigger value="offer" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('Offer Letter')}</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Phone className="h-5 w-5" />
                {t('Contact Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('Email')}</p>
                  <p className="text-sm text-gray-600">{candidate.email}</p>
                </div>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('Phone')}</p>
                    <p className="text-sm text-gray-600">{candidate.phone}</p>
                  </div>
                </div>
              )}
              {candidate.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('Address')}</p>
                    <p className="text-sm text-gray-600">{candidate.address}</p>
                  </div>
                </div>
              )}
              {candidate.city && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('City')}</p>
                    <p className="text-sm text-gray-600">{candidate.city}</p>
                  </div>
                </div>
              )}
              {candidate.state && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('State')}</p>
                    <p className="text-sm text-gray-600">{candidate.state}</p>
                  </div>
                </div>
              )}
              {candidate.country && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('Country')}</p>
                    <p className="text-sm text-gray-600">{candidate.country}</p>
                  </div>
                </div>
              )}
              {candidate.zip_code && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('Zip Code')}</p>
                    <p className="text-sm text-gray-600">{candidate.zip_code}</p>
                  </div>
                </div>
              )}
              {candidate.linkedin_url && (
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">LinkedIn</p>
                    <a 
                      href={candidate.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      {t('View Profile')}
                    </a>
                  </div>
                </div>
              )}
              {candidate.portfolio_url && (
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('Portfolio')}</p>
                    <a 
                      href={candidate.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      {t('View Portfolio')}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Briefcase className="h-5 w-5" />
                {t('Campaign - Job Posting')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{candidate.job?.title || candidate.campaign || t('General Application')}</h3>
                <p className="text-sm text-gray-600 mt-1">{candidate.job?.job_code || ''}</p>
              </div>
              <div className="space-y-3">
                {candidate.branch && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{candidate.branch?.name}</span>
                </div>
                )}
                {candidate.job?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{candidate.job?.location?.name}</span>
                </div>
                )}
                {candidate.job?.job_type && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{candidate.job?.job_type?.name}</span>
                </div>
                )}
                {candidate.department && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{t('Department')}: {candidate.department.name}</span>
                  </div>
                )}
                {candidate.source && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{t('Sourced By')}: {candidate.source?.name}</span>
                  </div>
                )}
                {candidate.sourced_by && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{t('Sourced By')}: {candidate.sourced_by}</span>
                  </div>
                )}

                {candidate.referral_employee && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{t('Referred by')}: {candidate.referral_employee.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <DollarSign className="h-5 w-5" />
                {t('Professional Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate.experience_years !== null && (
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('Experience')}</p>
                  <p className="text-sm text-gray-600">{candidate.experience_years} {t('years')}</p>
                </div>
              )}
              {candidate.current_salary && (
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('Current Salary')}</p>
                  <p className="text-sm text-gray-600">${candidate.current_salary.toLocaleString()}</p>
                </div>
              )}
              {candidate.expected_salary && (
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('Expected Salary')}</p>
                  <p className="text-sm text-gray-600">${candidate.expected_salary.toLocaleString()}</p>
                </div>
              )}
              {candidate.final_salary && (
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('Final Salary')}</p>
                  <p className="text-sm text-gray-600">${candidate.final_salary.toLocaleString()}</p>
                </div>
              )}
              {candidate.notice_period && (
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('Notice Period')}</p>
                  <p className="text-sm text-gray-600">{candidate.notice_period}</p>
                </div>
              )}
              {candidate.gender && (
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('Gender')}</p>
                  <p className="text-sm text-gray-600 capitalize">{candidate.gender}</p>
                </div>
              )}
              {candidate.languages_known && (
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('Languages Known')}</p>
                  <p className="text-sm text-gray-600">{candidate.languages_known}</p>
                </div>
              )}
              {candidate.date_of_birth && (
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('Date of Birth')}</p>
                  <p className="text-sm text-gray-600">{new Date(candidate.date_of_birth).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documents */}
        {(candidate.resume_path || candidate.cover_letter_path) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="h-5 w-5" />
                {t('Documents')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate.resume_path && (
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('Resume')}</p>
                    <a 
                      href={getImagePath(candidate.resume_path)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline font-medium"
                      download
                    >
                      {t('Download Resume')}
                    </a>
                  </div>
                </div>
              )}
              {candidate.cover_letter_path && (
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('Cover Letter')}</p>
                    <a 
                      href={getImagePath(candidate.cover_letter_path)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline font-medium"
                      download
                    >
                      {t('Download Cover Letter')}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cover Letter Message */}
        {candidate.coverletter_message && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Mail className="h-5 w-5" />
                {t('Cover Letter Message')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{candidate.coverletter_message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Questions */}
        {candidate.custom_question && Object.keys(candidate.custom_question).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Award className="h-5 w-5" />
                {t('Custom Questions & Answers')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(candidate.custom_question).map(([question, answer], index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <p className="text-sm font-medium text-gray-900">{question}</p>
                    <p className="text-sm text-gray-600 mt-1">{String(answer)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Clock className="h-5 w-5" />
              {t('Additional Information')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{t('Terms & Conditions')}</p>
                <Badge className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  candidate.terms_condition_check === 'on'
                    ? 'bg-green-50 text-green-700 ring-green-600/20'
                    : 'bg-red-50 text-red-700 ring-red-600/20'
                }`}>
                  {candidate.terms_condition_check === 'on' ? t('Accepted') : t('Not Accepted')}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t('Applied Date')}</p>
                <p className="text-sm text-gray-600">{new Date(candidate.application_date).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
          </Card>
        </TabsContent>

          {['Offer', 'Offered'].includes(candidate.status) && (
            <TabsContent value="offer" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>{t('Generate & Send Offer Letter')}</CardTitle>
                  <CardDescription>{t('Fill the details below to generate a PDF offer letter and send it to the candidate via email.')}</CardDescription>
                </CardHeader>
                <form onSubmit={handleSendOffer}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="offer_template_id">{t('Offer Template')} <span className="text-red-500">*</span></Label>
                        <Select
                          value={data.offer_template_id}
                          onValueChange={(value) => setData('offer_template_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('Select Template')} />
                          </SelectTrigger>
                          <SelectContent>
                            {offerTemplates?.map((template: any) => (
                              <SelectItem key={template.id} value={template.id.toString()}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.offer_template_id && <p className="text-sm text-red-500">{errors.offer_template_id}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="salary">{t('Offered Salary')} <span className="text-red-500">*</span></Label>
                        <Input
                          id="salary"
                          type="number"
                          value={data.salary}
                          onChange={(e) => setData('salary', e.target.value)}
                          placeholder="e.g. 50000"
                        />
                        {errors.salary && <p className="text-sm text-red-500">{errors.salary}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="start_date">{t('Start Date')} <span className="text-red-500">*</span></Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={data.start_date}
                          onChange={(e) => setData('start_date', e.target.value)}
                        />
                        {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expiration_date">{t('Expiration Date')} <span className="text-red-500">*</span></Label>
                        <Input
                          id="expiration_date"
                          type="date"
                          value={data.expiration_date}
                          onChange={(e) => setData('expiration_date', e.target.value)}
                        />
                        {errors.expiration_date && <p className="text-sm text-red-500">{errors.expiration_date}</p>}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Label htmlFor="message">{t('Additional Message (Email Body)')}</Label>
                      <Textarea
                        id="message"
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                        rows={4}
                        placeholder={t('Any additional notes to include in the email body...')}
                      />
                      {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t pt-4">
                    <Button type="submit" disabled={processing} className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      {processing ? t('Sending...') : (candidate.offers && candidate.offers.length > 0) ? t('Offer Letter sent - Resend new offer') : t('Send Offer Letter')}
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {candidate.offers && candidate.offers.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Sent Offers')}</h3>
                  <div className="space-y-4">
                    {candidate.offers.map((offer: any) => (
                      <Card key={offer.id}>
                        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div>
                            <p className="font-medium text-gray-900">{t('Sent on')}: {new Date(offer.created_at).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500">{t('Salary')}: {window.appSettings?.formatCurrency ? window.appSettings.formatCurrency(offer.salary) : offer.salary}</p>
                            <p className="text-sm text-gray-500">{t('Start Date')}: {new Date(offer.start_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <Badge className="bg-green-50 text-green-700 ring-green-600/20 border border-green-200">
                              {t(offer.status)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PageTemplate>
  );
}