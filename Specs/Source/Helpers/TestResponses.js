var TestResponses = {
    models: {
        stop: {
            success: {
                status: 200,
                responseText: '{"info": {"status": 200, "routes": 3, "stop_name": "JOHN at CHARLTON", "id": 1785, "stop_code": 2097}, "routes": [{"times": [{"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "17:00:11"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "17:15:11"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "17:30:11"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "17:45:11"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "18:08:11"}], "name": "UPPER KENILWORTH", "number": 21}, {"times": [{"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6", "stop_time": "17:08:13"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6", "stop_time": "17:23:13"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6", "stop_time": "17:38:13"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6", "stop_time": "17:51:13"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 6", "stop_time": "17:56:48"}], "name": "COLLEGE", "number": 35}, {"times": [{"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "17:10:21"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "17:25:21"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "17:40:21"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "17:55:21"}, {"endpoint": "Northbound to MACNAB TERMINAL PLATFORM 7", "stop_time": "18:13:21"}], "name": "SANATORIUM", "number": 33}]}'
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
                responseText: '[{"routes": [5, 51], "stop_name": "UNIVERSITY opposite LIFE SCIENCES", "id": 355277, "stop_code": 1183}, {"routes": [5, 51], "stop_name": "UNIVERSITY at FORSYTH", "id": 2190, "stop_code": 2650}, {"routes": [5], "stop_name": "UNIVERSITY PLAZA PLATFORM 1", "id": 355260, "stop_code": 1312}, {"routes": [1], "stop_name": "UNIVERSITY opposite LIFE SCIENCES", "id": 2186, "stop_code": 1097}, {"routes": [1, 5, 51], "stop_name": "UNIVERSITY at LIFE SCIENCES", "id": 2185, "stop_code": 2748}, {"routes": [5, 51], "stop_name": "UNIVERSITY at FORSYTH", "id": 2189, "stop_code": 1344}, {"routes": [44], "stop_name": "GARNER at REDEEMER UNIVERSITY", "id": 355523, "stop_code": 4467}, {"routes": [10], "stop_name": "UNIVERSITY PLAZA PLATFORM 2", "id": 355570, "stop_code": 1312}, {"routes": [5, 51], "stop_name": "STERLING at UNIVERSITY", "id": 2664, "stop_code": 1182}, {"routes": [1], "stop_name": "STERLING at UNIVERSITY", "id": 2662, "stop_code": 1119}]'
            },

            error: {
                status: 500,
                responseText: ''
            }
        }
    }
};