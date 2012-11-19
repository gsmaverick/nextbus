var TestResponses = {
    models: {
        stop: {
            success: {
                status: 200,
                responseText: '{"info": {"status": 200, "routes": 3, "stop_name": "JOHN at CHARLTON", "stop_id": 2097}, "routes": [{"times": [{"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6", "stop_time": "17:41:18"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6", "stop_time": "18:01:18"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6", "stop_time": "18:21:18"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6", "stop_time": "18:38:18"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6", "stop_time": "19:03:18"}], "name": "COLLEGE", "number": 35}, {"times": [{"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "17:54:41"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "18:21:41"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "18:51:41"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "19:21:41"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "19:51:41"}], "name": "UPPER KENILWORTH", "number": 21}, {"times": [{"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "18:10:35"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "18:42:35"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "19:10:35"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "19:42:35"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "20:10:35"}], "name": "SANATORIUM", "number": 33}]}'
            }
        },

        route: {
            "times": [
                {
                    "endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6",
                    "stop_time": "17:41:18"
                }, {
                    "endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6",
                    "stop_time": "18:01:18"
                }, {
                    "endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6",
                    "stop_time": "18:21:18"
                }, {
                    "endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6",
                    "stop_time": "18:38:18"
                }, {
                    "endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6",
                    "stop_time": "19:03:18"
                }
            ],
            "name": "COLLEGE",
            "number": 35
        },

        search: {
            success: {
                status: 200,
                responseText: '[{"routes": [5, 51], "stop_name": "UNIVERSITY opposite LIFE SCIENCES", "stop_code": 1183}, {"routes": [5, 51], "stop_name": "UNIVERSITY at FORSYTH", "stop_code": 2650}, {"routes": [5], "stop_name": "UNIVERSITY PLAZA PLATFORM 1", "stop_code": 1312}, {"routes": [1], "stop_name": "UNIVERSITY opposite LIFE SCIENCES", "stop_code": 1097}, {"routes": [1, 5, 51], "stop_name": "UNIVERSITY at LIFE SCIENCES", "stop_code": 2748}, {"routes": [5, 51], "stop_name": "UNIVERSITY at FORSYTH", "stop_code": 1344}, {"routes": [44], "stop_name": "GARNER at REDEEMER UNIVERSITY", "stop_code": 4467}, {"routes": [10], "stop_name": "UNIVERSITY PLAZA PLATFORM 2", "stop_code": 1312}, {"routes": [5, 51], "stop_name": "STERLING at UNIVERSITY", "stop_code": 1182}, {"routes": [1], "stop_name": "STERLING at UNIVERSITY", "stop_code": 1119}, {"routes": [1], "stop_name": "STERLING at UNIVERSITY", "stop_code": 1097}, {"routes": [5, 51], "stop_name": "STERLING at UNIVERSITY", "stop_code": 1119}]'
            },

            error: {
                status: 500,
                responseText: ''
            }
        }
    }
};