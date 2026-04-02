<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('main');
});

Route::view('/login', 'main')->name('login');
Route::view('/signup', 'main')->name('signup');
Route::view('/main', 'main')->name('main');
