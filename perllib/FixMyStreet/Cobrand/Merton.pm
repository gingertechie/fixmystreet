package FixMyStreet::Cobrand::Merton;
use parent 'FixMyStreet::Cobrand::Whitelabel';

use strict;
use warnings;

sub council_area_id { 2500 }
sub council_area { 'Merton' }
sub council_name { 'Merton Council' }
sub council_url { 'merton' }
sub send_questionnaires { 0 }

sub disambiguate_location {
    my $self    = shift;
    my $string  = shift;

    my $town = "Merton";

    return {
        %{ $self->SUPER::disambiguate_location() },
        town => $town,
        centre => '51.4099496632915,-0.197255310605401',
        span   => '0.0612811278185319,0.130096741684365',
        bounds => [ 51.3801834993027, -0.254262247988426, 51.4414646271213, -0.124165506304061 ],
    };
}

sub enter_postcode_text { 'Enter a postcode, street name and area, or check an existing report number' }

sub get_geocoder { 'OSM' }

sub admin_user_domain { 'merton.gov.uk' }

sub allow_anonymous_reports { 'button' }

sub anonymous_account {
    my $self = shift;
    return {
        # Merton requested something other than @merton.gov.uk due to their CRM misattributing reports to staff.
        email => $self->feature('anonymous_account') . '@anonymous-fms.merton.gov.uk',
        name => 'Anonymous user',
    };
}

sub open311_config {
    my ($self, $row, $h, $params) = @_;

    $params->{multi_photos} = 1;
    $params->{upload_files} = 1;
}

sub reopening_disallowed {
    my ($self, $problem) = @_;
    # allow admins to restrict staff from reopening categories using category control
    return 1 if $self->next::method($problem);
    # only Merton staff may reopen reports
    my $c = $self->{c};
    my $user = $c->user;
    return 0 if ($c->user_exists && $user->from_body && $user->from_body->cobrand_name eq 'Merton Council');
    return 1;
}

sub open311_extra_data_include {
    my ($self, $row, $h) = @_;

    # Reports made via FMS.com or the app probably won't have a USRN
    # value because we don't access the USRN layer on those
    # frontends. Instead we'll look up the closest asset from the WFS
    # service at the point we're sending the report over Open311.
    if (!$row->get_extra_field_value('usrn')) {
        if (my $usrn = $self->lookup_site_code($row, 'usrn')) {
            $row->update_extra_field({ name => 'usrn', value => $usrn });
        }
    }

    return [];
}

sub open311_get_update_munging {
    my ($self, $comment) = @_;

    my $latest = $comment->problem->comments->search({ state => 'confirmed' }, {
        order_by => [ { -desc => 'confirmed' }, { -desc => 'id' } ],
        rows => 1,
    })->first;
    # If last update has same text and is the system user, hide it
    if ($latest && $latest->text eq $comment->text && $latest->user_id == $comment->user_id) {
        $comment->state('hidden');
    }
}

sub report_new_munge_before_insert {
    my ($self, $report) = @_;

    return unless $report->to_body_named('Merton');

    # Workaround for anonymous reports not having a service associated with them.
    if (!$report->service) {
        $report->service('unknown');
    }

    # Save the service attribute into extra data as well as in the
    # problem to avoid having the field appear as blank and required
    # in the inspector toolbar for users with 'inspect' permissions.
    if (!$report->get_extra_field_value('service')) {
        $report->update_extra_field({ name => 'service', value => $report->service });
    }
}

sub lookup_site_code {
    my $self = shift;
    my $row = shift;
    my $field = shift;

    my ($x, $y) = $row->local_coords;
    my $buffer = 50;
    my ($w, $s, $e, $n) = ($x-$buffer, $y-$buffer, $x+$buffer, $y+$buffer);

    my $filter = "
    <ogc:Filter xmlns:ogc=\"http://www.opengis.net/ogc\">
        <ogc:And>
            <ogc:PropertyIsNotEqualTo>
                <ogc:PropertyName>street_type</ogc:PropertyName>
                <ogc:Literal>Numbered Street</ogc:Literal>
            </ogc:PropertyIsNotEqualTo>
            <ogc:BBOX>
                <ogc:PropertyName>geometry</ogc:PropertyName>
                <gml:Envelope xmlns:gml='http://www.opengis.net/gml' srsName='EPSG:27700'>
                    <gml:lowerCorner>$w $s</gml:lowerCorner>
                    <gml:upperCorner>$e $n</gml:upperCorner>
                </gml:Envelope>
                <Distance units='m'>50</Distance>
            </ogc:BBOX>
        </ogc:And>
    </ogc:Filter>";
    $filter =~ s/\n\s+//g;

    my $cfg = {
        url => FixMyStreet->config('STAGING_SITE') ? "https://tilma.staging.mysociety.org/mapserver/openusrn" : "https://tilma.mysociety.org/mapserver/openusrn",
        srsname => "urn:ogc:def:crs:EPSG::27700",
        typename => 'usrn',
        property => "usrn",
        filter => $filter,
        accept_feature => sub { 1 },
    };

    my $features = $self->_fetch_features($cfg, $x, $y);
    return $self->_nearest_feature($cfg, $x, $y, $features);
}

sub cut_off_date { '2020-12-06' } # 1 yr prior to FMS Pro go-live

sub abuse_reports_only { 1 }

1;
