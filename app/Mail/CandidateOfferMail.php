<?php

namespace App\Mail;

use App\Models\Candidate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Attachment;

class CandidateOfferMail extends Mailable
{
    use Queueable, SerializesModels;

    public $candidate;
    public $pdfContent;
    public $attachmentName;
    public $customMessage;

    public function __construct(Candidate $candidate, $pdfContent, $attachmentName, $customMessage = null)
    {
        $this->candidate = $candidate;
        $this->pdfContent = $pdfContent;
        $this->attachmentName = $attachmentName;
        $this->customMessage = $customMessage;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new \Illuminate\Mail\Mailables\Address('owais.sybscit@gmail.com', config('app.name')),
            subject: 'Job Offer from ' . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.candidate_offer',
        );
    }

    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdfContent, $this->attachmentName)
                    ->withMime('application/pdf'),
        ];
    }
}
