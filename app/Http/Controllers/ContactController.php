<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactUsMessage;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'message' => ['required', 'string', 'min:5'],
        ]);
        $to = config('mail.support_address', env('SUPPORT_EMAIL', 'support@accountsparadise.com'));
        Mail::to($to)->send(new ContactUsMessage($data['email'], $data['message']));
        return response()->json(['status' => 'sent']);
    }
}
