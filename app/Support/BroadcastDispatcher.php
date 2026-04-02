<?php

namespace App\Support;

final class BroadcastDispatcher
{
    public static function dispatch(object $event): void
    {
        try {
            broadcast($event);
        } catch (\Throwable $exception) {
            report($exception);
        }
    }
}
