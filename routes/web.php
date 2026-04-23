<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('main');
});

Route::view('/login', 'main')->name('login');
Route::view('/signup', 'main')->name('signup');
Route::view('/main', 'main')->name('main');
Route::view('/setting', 'main')->name('setting');
Route::view('/dashboard', 'main')->name('dashboard');
Route::view('/attendance', 'main')->name('attendance');
Route::view('/employees', 'main')->name('employees');
Route::view('/tasks/new', 'main')->name('tasks.new');
Route::view('/tasks', 'main')->name('tasks');
