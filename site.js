function sub() {
    var name = get("contest-name").value;
    var desc = get("contest-desc").value;
    var type = get("contest-type").value;
    var creator = get("contest-creator").value;
    var start_date = get("contest-start-date").value;
    var end_date = get("contest-end-date").value;
    var start_time = get("contest-start-time").value;
    var end_time = get("contest-end-time").value;
    var judges = get("contest-judges-panel").selected ? "Panel" : "Community";
    var requirements = parse(get("contest-requirements").value);
    var string = `{"name":"${name}","description":"${desc}","type":"${type}","creator":"${creator}","start_date":"${start_date}","end_date":"${end_date}","start_time":"${start_time}","end_time":"${end_time}","judges":"${judges}","requirements":"${requirements}"}`
    for (var x = 0; x < string.length; x++) {
        string = string.replace(" ", "_");
    }
    document.write(string);
}

function get(id) {
    return document.getElementById(id);
}

function parse(string) {
    var x = string.split(", ");
    return x;
}