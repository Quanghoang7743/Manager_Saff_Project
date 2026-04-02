<?php

namespace App\Support;

class PhoneNormalizer
{
    public static function normalize(?string $phone, ?string $defaultCountryCode = null): ?string
    {
        if ($phone === null) {
            return null;
        }

        $raw = trim($phone);
        if ($raw === '') {
            return null;
        }

        $raw = preg_replace('/[\s\-().]/', '', $raw) ?? $raw;

        if (str_starts_with($raw, '00')) {
            $raw = '+'.substr($raw, 2);
        }

        if (str_starts_with($raw, '+')) {
            $digits = preg_replace('/\D+/', '', substr($raw, 1)) ?? '';

            return $digits === '' ? null : '+'.$digits;
        }

        $digits = preg_replace('/\D+/', '', $raw) ?? '';
        if ($digits === '') {
            return null;
        }

        $country = $defaultCountryCode ?: (string) config('friends.default_country_code', '84');
        $country = preg_replace('/\D+/', '', $country) ?? '84';

        if (str_starts_with($digits, '0')) {
            $local = ltrim($digits, '0');

            return $local === '' ? null : '+'.$country.$local;
        }

        return '+'.$digits;
    }
}
