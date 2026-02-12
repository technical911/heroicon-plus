<?php

namespace Technical911\HeroiconPlus\Tests;

use Technical911\HeroiconPlus\ServiceProvider;
use Statamic\Testing\AddonTestCase;

abstract class TestCase extends AddonTestCase
{
    protected string $addonServiceProvider = ServiceProvider::class;
}
