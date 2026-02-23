<!DOCTYPE html>
<html>
<head>
    <title>Job Offer</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6;">
    <p>Dear {{ $candidate->first_name }} {{ $candidate->last_name }},</p>

    <p>We are delighted to offer you the position of {{ $candidate->job ? $candidate->job->title : 'General Application' }} with us.</p>
    
    @if($customMessage)
        <p>{{ $customMessage }}</p>
    @else
        <p>Please find attached your official offer letter outlining the details of your employment, including salary, start date, and benefits.</p>
        <p>We kindly ask that you review the attached document and let us know your decision by the expiration date mentioned within the letter.</p>
    @endif

    <p>If you have any questions, please feel free to reach out to us.</p>

    <p>Looking forward to welcoming you to the team!</p>

    <p>Best Regards,</p>
    <p>{{ config('app.name') }}</p>
</body>
</html>
