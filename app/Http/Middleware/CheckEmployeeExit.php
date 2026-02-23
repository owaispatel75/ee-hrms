<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckEmployeeExit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if ($user && $user->type === 'employee') {
            $employee = $user->employee;
            
            if ($employee && $employee->date_of_exit) {
                $exitTime = \Carbon\Carbon::parse($employee->date_of_exit)->setTime(18, 0, 0); // 6 PM
                
                if (now()->greaterThan($exitTime)) {
                    // Update user status to inactive if not already
                    if ($user->status !== 'inactive') {
                        $user->update(['status' => 'inactive']);
                    }

                    auth()->logout();
                    
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    return redirect()->route('login')->with('error', __('Your access has been revoked following your exit from the company.'));
                }
            }
        }

        return $next($request);
    }
}
