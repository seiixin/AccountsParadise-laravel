<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BuyerController extends Controller
{
    public function dashboard(): Response
    {
        return Inertia::render('Buyer/Dashboard');
    }

    public function disputes(): Response
    {
        return Inertia::render('Buyer/Disputes');
    }
}
