    function fnGetBars(data)
    {
        $("#time").html(data.LastUpdateDate);
        var pct = (data.CurrentTotalHashRate / data.MaxTotalHashRate) * 100;
        $(".mnCnt").html(data.RIGs);
        $(".gpCnt").html(data.GPUs);
        $(".overallbarfill").css("width", pct + '%');
        $(".overallbarfill").html(Math.round(pct) + '% of ' + Math.round(data.MaxTotalHashRate) + 'Mh/s');
        $(".hshRate").html(addCommas(Math.round(data.CurrentTotalHashRate)));
        var itms = data.Miners;
        var pct;
        var color;
        var output = '';
        for (var j = 0; j < itms.length; j++) {
            var html = '';
            html += '<div id="' + itms[j].miner + '" class="Mstr" ht="' + chartHt + '" ip="' + itms[j].IPAddress + '" minerid="' + itms[j].MinerID + '" onClick="pickMiner(\'' + itms[j].miner + '\');">';
            var gpus = itms[j].gpus;
            var maxhash = itms[j].maxhash;
            var currhash = itms[j].hash;
            for (var i = 0; i < gpus.length; i++) {
                pct = (1 - ((maxhash / gpus.length) - gpus[i].hash) / (maxhash / gpus.length)) * 100;
                color = 'green';
                if (pct <= 85 && pct >= 60) color = 'yellow';
                if (pct < 60) color = 'red';
                if (pct == 0) color = 'zero';
                var bor = 'greenborder';
                if (gpus[i].temp <= 75 && gpus[i].temp >= 60) bor = 'yellowborder';
                if (gpus[i].temp > 75) bor = 'redborder';
                var faran = gpus[i].temp * 9 / 5 + 32;
                html += '<div title="Hashrate: ' + gpus[i].hash + '\nTemp: ' + gpus[i].temp + '°C / ' + faran + '°F\nFan: ' + gpus[i].fan + '%" tooltip=title="Hashrate: ' + gpus[i].hash + '\nTemp: ' + gpus[i].temp + '°C / ' + faran + '°F\nFan: ' + gpus[i].fan + '%" class="container"><div class="Child ' + color + ' ' + bor + '" ht=' + pct + '></div>' + Math.round(gpus[i].hash) + '</div>';
            }
            pct = (1 - (itms[j].maxhash - itms[j].hash) / itms[j].maxhash) * 100;
            color = 'green';
            if (pct < 85 && pct > 60) color = 'yellow';
            if (pct < 60) color = 'red';
            var alerts = '<div class="alerts"><div><a class="cnt">' + itms[j].Min30 + '</a><a class="duration">30 m</a></div><div><a class="cnt">' + itms[j].Hr2 + '</a><a class="duration">2 h</a></div><div><a class="cnt">' + itms[j].Hr6 + '</a><a class="duration">6 h</a></div><div><a class="cnt">' + itms[j].D1 + '</a><a class="duration">1 d</a></div><div><a class="cnt">' + itms[j].D2 + '</a><a class="duration">2 d</a></div></div>'
            html += '<div class="Miner"><div class="minerbar ' + color + '" wd="' + pct + '"></div>' + Math.round(itms[j].hash) + '/' + Math.round(itms[j].maxhash) + '</div>' + alerts + '<input type="button" class="btnMiner" id="btn' + itms[j].miner + '" value="' + itms[j].miner + '" ></div>';

            if ($("#" + itms[j].miner).length > 0)
                $("#" + itms[j].miner).replaceWith(html);
            else
                $("#cnt").append(html);
        }
        $(".Mstr").each(function () { $(".container").css("height", $(this).attr("ht") + 'px'); });
        $(".Child").each(function () { $(this).css("height", $(this).attr("ht") + '%'); });
        $(".minerbar").each(function () { $(this).css("width", $(this).attr("wd") + '%'); });
        $(".cnt").each(function () { if ($(this).html() != "0") $(this).css("background-color", "red"); });
        pickMiner('');
    }

    function addCommas(nStr) {
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    function pickMiner(Miner)
    {
        if (Miner =='')
            Miner = $("#selectedMiner").val();
        else
            $("#selectedMiner").val(Miner);
        $(".Mstr").attr("class", "Mstr");
        $(".btnMiner").attr("class", "btnMiner");
        var id = '#btn' + Miner;
        $(id).attr("class", "btnMiner chart");
        if (Miner != '') {
            var id = '#' + Miner;
            $(id).attr("class", "Mstr Sel");
            getChart('GPU', Miner);
        }
    }

    function getAllMinersChart() {
        var url;
        if (window.location.href.split('/')[2].split(':')[0].toLowerCase() == 'basement' || window.location.href.split('/')[2].split(':')[0].toLowerCase() == 'localhost')
            url = 'getdata.aspx?charttype=ALL';
        else
            url = 'https://raw.githubusercontent.com/tcsekhar/Mining/master/MinersChart.json?s=' + Math.random();
        $.get(url, function (data) {
            gpus = JSON.parse(data);
            var ctx3 = document.getElementById("gpus").getContext("2d");
            window.myLine = new Chart(ctx3, gpus);
            $("#btnShowSSH").attr("class", "");
            $("#btnShowSSH").attr("class", "hidden");
            $("#btnShowSSH").attr("Miner", '');
            $("#selectedMiner").val('');
            $(".Mstr").attr("class", "Mstr");
            $(".btnMiner").attr("class", "btnMiner");
        });
    }    
    
    function getChart(type, Miner) {
        $("#chartLoc").html('<canvas id="gpus"></canvas>');
        var url;
        var id = '#' + Miner;
        var MinerID = $(id).attr("minerid");
        if (window.location.href.split('/')[2].split(':')[0].toLowerCase() == 'basement' || window.location.href.split('/')[2].split(':')[0].toLowerCase() == 'localhost')
            url = 'getdata.aspx?charttype=GPU&MinerID=' + MinerID;
        else
            url = 'https://raw.githubusercontent.com/tcsekhar/Mining/master/' + Miner + '.JSON?s=' + Math.random();

        $.get(url, function (data) {
            gpus = JSON.parse(data);
            var ctx3 = document.getElementById("gpus").getContext("2d");
            window.myLine = new Chart(ctx3, gpus);
            if (Miner != '') {
                $("#btnShowSSH").attr("Miner",Miner);
                $("#btnShowSSH").attr("class", "");
                $("#btnShowSSH").val("Login " + Miner + " [SSH]");
            }
            else
                $("#btnShowSSH").attr("class", "hidden");
        });
    }

    function showSSH()
    {
        var Miner = $("#selectedMiner").val();
        var id = '#' + Miner;
        $("#iframe").html('<iframe src="http://' + $(id).attr("ip") + '/" frameborder="0" scrolling="no" id="sshframe" height="100%" width="100%">')
    }