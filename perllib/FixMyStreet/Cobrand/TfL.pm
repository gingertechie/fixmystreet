package FixMyStreet::Cobrand::TfL;
use parent 'FixMyStreet::Cobrand::Whitelabel';

use strict;
use warnings;

use POSIX qw(strcoll);

use FixMyStreet::MapIt;
use mySociety::AuthToken;

sub council_area_id { return [
    2511, 2489, 2494, 2488, 2482, 2505, 2512, 2481, 2484, 2495,
    2493, 2508, 2502, 2509, 2487, 2485, 2486, 2483, 2507, 2503,
    2480, 2490, 2492, 2500, 2510, 2497, 2499, 2491, 2498, 2506,
    2496, 2501, 2504
]; }
sub council_area { return 'TfL'; }
sub council_name { return 'TfL'; }
sub council_url { return 'tfl'; }
sub area_types  { [ 'LBO' ] }
sub is_council { 0 }

sub area_check {
    my ( $self, $params, $context ) = @_;

    my $councils = $params->{all_areas};
    my $council_match = grep { $councils->{$_} } @{ $self->council_area_id };

    return 1 if $council_match;
    return ( 0, $self->area_check_error_message($params, $context) );
}

sub enter_postcode_text {
    my ($self) = @_;
    return 'Enter a London postcode, or street name and area';
}

sub body {
    # Overridden because UKCouncils::body excludes TfL
    FixMyStreet::DB->resultset('Body')->search({ name => 'TfL' })->first;
}

# This needs to be overridden so the method in UKCouncils doesn't create
# a fixmystreet.com link (because of the false-returning owns_problem call)
sub relative_url_for_report { "" }

sub categories_restriction {
    my ($self, $rs) = @_;
    return $rs->search( { 'body.name' => 'TfL' } );
}

sub admin_user_domain { 'tfl.gov.uk' }

sub allow_anonymous_reports { 'button' }

sub anonymous_account {
    my $self = shift;
    my $token = mySociety::AuthToken::random_token();
    return {
        email => $self->feature('anonymous_account') . '-' . $token . '@' . $self->admin_user_domain,
        name => 'Anonymous user',
    };
}

sub lookup_by_ref_regex {
    return qr/^\s*((?:FMS\s*)?\d+)\s*$/;
}

sub lookup_by_ref {
    my ($self, $ref) = @_;

    if ( $ref =~ s/^\s*FMS\s*// ) {
        return { 'id' => $ref };
    }

    return 0;
}

sub report_sent_confirmation_email { 'id' }

sub report_age { '6 weeks' }

sub pin_colour {
    my ( $self, $p, $context ) = @_;
    return 'green' if $p->is_closed;
    return 'green' if $p->is_fixed;
    return 'red' if $p->state eq 'confirmed';
    return 'orange'; # all the other `open_states` like "in progress"
}

sub admin_allow_user {
    my ( $self, $user ) = @_;
    return 1 if $user->is_superuser;
    return undef unless defined $user->from_body;
    return $user->from_body->name eq 'TfL';
}

=head2 admin_fetch_inspector_areas

Inspector users in TfL are assigned to London borough (LBO) areas, not
wards/districts.

This hook is called when rendering the user editing form, and sets the
appropriate areas in the stash that are shown in the areas dropdown on the form.

=cut

sub admin_fetch_inspector_areas {
    my ($self, $body) = @_;

    return undef unless $body;
    return undef unless $body->name eq 'TfL';

    my $areas = FixMyStreet::MapIt::call('areas', $self->area_types);
    $self->{c}->stash->{areas} = [ sort { strcoll($a->{name}, $b->{name}) } values %$areas ];
    $self->{c}->stash->{fetched_areas_body_id} = $body->id;

    return 1;
}

sub all_reports_ward_areas {
    my $self = shift;

    FixMyStreet::MapIt::call('areas', $self->area_types);
}

sub munge_singlevaluelist_value {
    my ($self, $prefix, $value) = @_;

    $value->{safety_critical} = 1 if $self->{c}->get_param("$prefix.safety_critical");
}

sub available_permissions {
    my $self = shift;

    my $perms = $self->next::method();

    delete $perms->{Problems}->{report_edit_priority};
    delete $perms->{Bodies}->{responsepriority_edit};

    return $perms;
}

sub response_template_body_ids {
    my $self = shift;

    my $tfl_id = FixMyStreet::DB->resultset('Body')->find({ name => 'TfL' })->id;
    return {
        $tfl_id => 1
    };
}

1;
