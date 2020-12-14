var devtoolsPort = [];
var notifId = '';
chrome.runtime.onConnect.addListener(function(port){
	devtoolsPort.push(port);
});

var dsDebug = (chrome.runtime.id !== 'ikbablmmjldhamhcldjjigniffkkjgpo');


function addBlocking(){
	removeBlocking();
	if (chrome.declarativeWebRequest)
		chrome.declarativeWebRequest.onRequest.addRules([{
			id: 'dataslayerBlocking',
			conditions: [
				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostSuffix: 'google-analytics.com', pathPrefix: '/collect', schemes: ['http','https'] },
				}),

				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostSuffix: 'analytics.google.com', pathPrefix: '/g/collect', schemes: ['http','https'] },
				}),

				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostSuffix: 'facebook.com', pathPrefix: '/tr', schemes: ['http','https'] },
				}),
				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostContains: '.wt-eu02.net', pathPrefix: '/wt', schemes: ['http','https'] },
				}),
				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostSuffix: 'nqs-nl12-c2.youboranqs01.com', schemes: ['http','https'] },
				}),
				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostContains: '.scorecardresearch.com', pathPrefix: '/p', schemes: ['http','https'] },
				}),
				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostContains: 'kinesis.eu-west-1.amazonaws.com', schemes: ['http','https'] },
				}),
				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostContains: 'stags.bluekai.com', schemes: ['http','https'] },
				}),

				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostContains: 'google.com', pathPrefix: '/ads/ga-audiences', schemes: ['http','https'] },
				}),

				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostSuffix: 'google-analytics.com', pathPrefix: '/__utm.gif', schemes: ['http','https'] },
				}),

				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostSuffix: 'adservice.google.com', pathPrefix: '/ddm/fls/z/', schemes: ['http','https'] },
				}),
				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostSuffix: 'criteo.com', pathPrefix: '/event', schemes: ['http','https'] },
				}),

				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostSuffix: 'secure-it.imrworldwide.com', pathPrefix: '/cgi-bin/gn', schemes: ['http','https'] },
				}),
				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostSuffix: 'mc.yandex.ru', pathPrefix: '/webvisor', schemes: ['http','https'] },
				}),

				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostSuffix: 'stats.g.doubleclick.net', pathPrefix: '/__utm.gif', schemes: ['http','https'] },
				}),
				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostSuffix: 'doubleclick.net', pathPrefix: '/activity', schemes: ['http','https'] },
				}),
				new chrome.declarativeWebRequest.RequestMatcher({
					url: { pathPrefix: '/b/ss', queryContains: 'AQB=1', schemes: ['http','https'] },
				}),
				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostSuffix: 'api.segment.io', pathPrefix: '/v1/t', schemes: ['http','https'] },
				}),
				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostSuffix: 'api.segment.io', pathPrefix: '/v1/i', schemes: ['http','https'] },
				}),
				new chrome.declarativeWebRequest.RequestMatcher({
					url: { hostSuffix: 'api-js.mixpanel.com', pathPrefix: 'track', schemes: ['http','https'] },
				}),
				],
			actions: [
				new chrome.declarativeWebRequest.RedirectToTransparentImage()
			]}]);
}

function removeBlocking(){
	if (chrome.declarativeWebRequest)
		chrome.declarativeWebRequest.onRequest.removeRules(['dataslayerBlocking']);
}

chrome.storage.sync.get(null,function(items){
	if (items.hasOwnProperty('blockTags')&&items.blockTags===true) addBlocking();
	else removeBlocking();
});

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if (dsDebug) console.log(message);
	if (message.type==='dataslayer_gtm_push'||message.type==='dataslayer_gtm'||message.type==='dataslayer_tlm'||message.type==='dataslayer_tco'||message.type==='dataslayer_var'||message.type==='dataslayer_dtm'){
		message.tabID=sender.tab.id;
		devtoolsPort.forEach(function(v,i,x){
			try{v.postMessage(message);}catch(e){console.log(e);}
		});
	}
	else if (message.type==='dataslayer_pageload'||message.type==='dataslayer_opened'){
		chrome.tabs.executeScript(message.tabID,{ file: 'content.js', runAt: 'document_idle', allFrames: true });
	}
	else if (message.type==='dataslayer_refresh'){
		chrome.tabs.sendMessage(message.tabID,{ask: 'refresh'});
	}
	else if (message.type==='dataslayer_unload')
		chrome.tabs.executeScript(message.tabID,{ code: 'document.head.removeChild(document.getElementById(\'dataslayer_script\'));', runAt: "document_idle" });
	else if (message.type==='dataslayer_loadsettings'){
		if (message.data.blockTags)
			addBlocking();
		else
			removeBlocking();
		devtoolsPort.forEach(function(v,i,x){
			v.postMessage(message);
		});
	}
	else if (message.type==='openOptionsPage'){
	  if (chrome.runtime.openOptionsPage) {
	    // New way to open options pages, if supported (Chrome 42+).
	    chrome.runtime.openOptionsPage();
	  } else {
	    // Reasonable fallback.
	    window.open(chrome.runtime.getURL('options.html'));
  }
	}
});

chrome.runtime.onInstalled.addListener(function(details){
	if (details.reason==='install')
		chrome.tabs.create({url:'chrome-extension://'+chrome.runtime.id+'/options.html#install',active:true});
	else if ((details.reason==='update')&&(!dsDebug)){
		chrome.notifications.create('',
			{
				type:'basic',
				title:'dataslayer'+(dsDebug?' beta':''),
				message:'dataslayer'+(dsDebug?' beta':'')+' has been updated to version '+chrome.runtime.getManifest().version+'.\nClick here to see what\'s new.',
				iconUrl: 'i128.png'
			},
			function(notificationId){notifId=notificationId;}
		);
		chrome.notifications.onClicked.addListener(function(notificationId){
			if (notificationId===notifId) chrome.tabs.create({url:'chrome-extension://'+chrome.runtime.id+'/options.html#whatsnew',active:true});
		});
	}
});