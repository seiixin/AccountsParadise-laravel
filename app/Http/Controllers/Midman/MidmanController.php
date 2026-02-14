<?php

namespace App\Http\Controllers\Midman;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class MidmanController extends Controller
{
    public function dashboard(): Response
    {
        return Inertia::render('Midman/Dashboard');
    }
}
