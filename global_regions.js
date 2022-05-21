/*
   This is the object that I needed to create for myself, in order to get the exact region names that correspond to each country code. I did not want the player having to look up codes to find out who they defeated. In addition, it is also easy to miss that even when a country turns red upon defeat, some countries are so small on the map that you can barely tell if anything even happened.
   
   Whenever the region name is required for use in game, this object is looped through - seeking out what region matches the code that is currently in scope.
   
   IMPORTANT: This list is taken from the 'REGIONS' MD file inside jqvmap-master. It does NOT note the difference between the two Congo nations - yes, there are two! By not noting the difference I mean that it lists 'Congo' twice in exactly the same way, although it does provide the difference in Alpha-2 country codes. As this was initially copied into here, it caused what I thought was a bug in that clicking on the largest Congo nation with a game command (such as nuking it or any of that nice stuff) would not produce anything. In here, I have named the two nations by their official names 'Democratic Republic of the Congo', and 'the Congo'.
   
   This could have led to several bugs in game, due to 'Congo' being named the same. For instance, it would have been the case that a player would be locked out of diplomacy with both Congo nations if it had a deal with only one, since TOW does not allow multiple deals to be signed with multiple nations. 
*/

const worldNations = [
	"Afghanistan",
	"Antigua and Barbuda",
	"Albania",
	"Armenia",
	"Angola",
	"Argentina",
	"Austria",
	"Australia",
	"Azerbaijan",
	"Bosnia and Herzegovina",
	"Barbados",
	"Bangladesh",
	"Belgium",
	"Burkina Faso",
	"Bulgaria",
	"Burundi",
	"Benin",
	"Brunei Darussalam",
	"Bolivia",
	"Brazil",
	"Bahamas",
	"Bhutan",
	"Botswana",
	"Belarus",
	"Belize",
	"Canada",
	"Democratic Republic of the Congo",
	"Central African Republic",
	"The Congo",
	"Switzerland",
	"Cote d'Ivoire",
	"Chile",
	"Cameroon",
	"China",
	"Colombia",
	"Costa Rica",
	"Cuba",
	"Cape Verde",
	"Cyprus",
	"Czech Republic",
	"Germany",
	"Djibouti",
	"Denmark",
	"Dominica",
	"Dominican Republic",
	"Algeria",
	"Ecuador",
	"Estonia",
	"Egypt",
	"Eritrea",
	"Spain",
	"Ethiopia",
	"Finland",
	"Fiji",
	"Falkland Islands",
	"France",
	"Gabon",
	"United Kingdom",
	"Grenada",
	"Georgia",
	"French Guiana",
	"Ghana",
	"Greenland",
	"Gambia",
	"Guinea",
	"Equatorial Guinea",
	"Greece",
	"Guatemala",
	"Guinea-Bissau",
	"Guyana",
	"Honduras",
	"Croatia",
	"Haiti",
	"Hungary",
	"Indonesia",
	"Ireland",
	"Israel",
	"India",
	"Iraq",
	"Iran",
	"Iceland",
	"Italy",
	"Jamaica",
	"Jordan",
	"Japan",
	"Kenya",
	"Kyrgyz Republic",
	"Cambodia",
	"Comoros",
	"Saint Kitts and Nevis",
	"North Korea",
	"South Korea",
	"Kuwait",
	"Kazakhstan",
	"Lao People's Democratic Republic",
	"Lebanon",
	"Saint Lucia",
	"Sri Lanka",
	"Liberia",
	"Lesotho",
	"Lithuania",
	"Latvia",
	"Libya",
	"Morocco",
	"Moldova",
	"Madagascar",
	"Macedonia",
	"Mali",
	"Myanmar",
	"Mongolia",
	"Mauritania",
	"Malta",
	"Mauritius",
	"Maldives",
	"Malawi",
	"Mexico",
	"Malaysia",
	"Mozambique",
	"Namibia",
	"New Caledonia",
	"Niger",
	"Nigeria",
	"Nicaragua",
	"Netherlands",
	"Norway",
	"Nepal",
	"New Zealand",
	"Oman",
	"Panama",
	"Peru",
	"French Polynesia",
	"Papua New Guinea",
	"Philippines",
	"Pakistan",
	"Poland",
	"Portugal",
	"Paraguay",
	"Qatar",
	"Reunion",
	"Romania",
	"Serbia",
	"Russian Federation",
	"Rwanda",
	"Saudi Arabia",
	"Solomon Islands",
	"Seychelles",
	"Sudan",
	"Sweden",
	"Slovenia",
	"Slovakia",
	"Sierra Leone",
	"Senegal",
	"Somalia",
	"Suriname",
	"Sao Tome and Principe",
	"El Salvador",
	"Syrian Arab Republic",
	"Swaziland",
	"Chad",
	"Togo",
	"Thailand",
	"Tajikistan",
	"Timor-Leste",
	"Turkmenistan",
	"Tunisia",
	"Turkey",
	"Trinidad and Tobago",
	"Taiwan",
	"Tanzania",
	"Ukraine",
	"Uganda",
    "United Arab Emirates",
	"United States of America",
	"Uruguay",
	"Uzbekistan",
	"Venezuela",
	"Vietnam",
	"Vanuatu",
	"Yemen",
	"South Africa",
	"Zambia",
	"Zimbabwe"
];