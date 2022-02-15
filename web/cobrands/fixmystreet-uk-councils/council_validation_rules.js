confirm_validation_rules = {
    name: {
      required: true,
      maxlength: 50
    },
    phone: {
      maxlength: 20
    },
    detail: {
      required: true,
      maxlength: 2000
    }
};

body_validation_rules = {
    'Bath and North East Somerset Council': confirm_validation_rules,
    'Bromley Council': {
        detail: {
          required: true,
          maxlength: 1750
        }
    },
    'Buckinghamshire Council': confirm_validation_rules,
    'Cheshire East Council': confirm_validation_rules,
    'Hounslow Borough Council': confirm_validation_rules,
    'Isle of Wight Council': confirm_validation_rules,
    'Island Roads': confirm_validation_rules,
    'Lincolnshire County Council': confirm_validation_rules,
    'Merton Council': {
        // additional category questions for:
        // Abandoned Vehicles
        vehicle_registration_number: {
          maxlength: 255
        },
        vehicle_make_model: {
          maxlength: 255
        },
        vehicle_colour: {
          maxlength: 255
        },
        time_present: {
          maxlength: 255
        },
        // Clinical Waste on Street
        waste_type: {
          maxlength: 255
        },
        // Fly-Tipping
        evidence: {
          maxlength: 255
        },
    },
    'Northamptonshire Highways': {
        title: {
          required: true,
          maxlength: 120
        }
    },
    'Oxfordshire County Council': {
        detail: {
          required: true,
          maxlength: 1700
        },
        name: {
          required: true,
          maxlength: 50
        },
        phone: {
          maxlength: 20
        },
        email: {
          maxlength: 50
        }
    },
    'Peterborough City Council': $.extend({
        title: {
          required: true,
          maxlength: 50
        }
    }, confirm_validation_rules),
    'Rutland County Council': {
        title: {
          required: true,
          maxlength: 254
        },
        name: {
          required: true,
          maxlength: 40
        }
    },
    'Shropshire Council': {
        phone: {
            validUkPhone: true,
            maxlength: 20
        }
    }
};
