package ru.asavan.suno;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;

import java.util.LinkedHashMap;
import java.util.Map;


public class AndroidWebServerActivity extends Activity {
    private static final int STATIC_CONTENT_PORT = 8080;
    private static final int WEB_SOCKET_PORT = 8088;
    private static final String WEB_GAME_URL = "https://asavan.github.io/fool/";
    public static final String WEB_VIEW_URL = "file:///android_asset/www/index.html";
    public static final String MAIN_LOG_TAG = "SUNO_TAG";
    private static final boolean secure = false;

    private BtnUtils btnUtils;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
        btnUtils = new BtnUtils(this, STATIC_CONTENT_PORT, WEB_SOCKET_PORT, secure);
        try {
            addButtons(IpUtils.getIPAddressSafe());
            Map<String, String> mainParams = new LinkedHashMap<>();
            mainParams.put("mode", "ai");
            mainParams.put("showAll", "true");
            btnUtils.launchWebView(WEB_VIEW_URL, mainParams);
        } catch (Exception e) {
            Log.e(MAIN_LOG_TAG, "main", e);
        }
    }

    private void addButtons(String formattedIpAddress) {
        HostUtils hostUtils = new HostUtils(STATIC_CONTENT_PORT, WEB_SOCKET_PORT, secure);
        final String host = hostUtils.getStaticHost(formattedIpAddress);
        final String webSocketHost = hostUtils.getSocketHost(formattedIpAddress);
        {
            Map<String, String> mainParams = new LinkedHashMap<>();
            mainParams.put("mode", "ai");
            mainParams.put("showAll", "true");
            btnUtils.addButtonTwa(WEB_GAME_URL, mainParams, R.id.twa_ai);
            btnUtils.addButtonWebView(WEB_VIEW_URL, mainParams, R.id.ai);
            btnUtils.addButtonWebView(hostUtils.getStaticHost(IpUtils.LOCALHOST), mainParams, R.id.ai_localhost);
        }
        {
            Map<String, String> b = new LinkedHashMap<>();
            b.put("wh", webSocketHost);
            b.put("sh", host);
            b.put("mode", "server");
            btnUtils.addButtonBrowser(host, b, R.id.launch_browser);
            btnUtils.addButtonTwa(host, b, R.id.twa_real_ip, host);
        }
        {
            Map<String, String> b = new LinkedHashMap<>();
            b.put("wh", hostUtils.getSocketHost(IpUtils.LOCAL_IP));
            b.put("sh", host);
            b.put("mode", "server");
            btnUtils.addButtonTwa(hostUtils.getStaticHost(IpUtils.LOCAL_IP), b, R.id.twa_127);
            btnUtils.addButtonWebView(WEB_VIEW_URL, b, R.id.webview_localhost);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (btnUtils != null) {
            btnUtils.onDestroy();
        }
    }
}
