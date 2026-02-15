@component('mail::layout')
    @slot('header')
        <div></div>
    @endslot

    {{ $slot }}

    @slot('footer')
        <div></div>
    @endslot
@endcomponent
