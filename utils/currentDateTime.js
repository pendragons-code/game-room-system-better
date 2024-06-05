global.currentDateTime = function currentDateTime(setting, dateToFormat) {
	let dateObject = new Date();
	if(setting === "convert") dateObject = dateToFormat;
	const formattedDate = [
		dateObject.getDate().toString().padStart(2, "0"),
		(dateObject.getMonth() + 1).toString().padStart(2, "0"),
		dateObject.getFullYear(),
		dateObject.getHours().toString().padStart(2, "0"),
		dateObject.getMinutes().toString().padStart(2, "0"),
		dateObject.getSeconds().toString().padStart(2, "0")
	].join("-");
	if(setting === "timeOnly") return `${formattedDate}`;
	return `[time: ${formattedDate}]`;
	// returns the exact time data, i was tryna avoid using an external package to do this
}
