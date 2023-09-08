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
    public static final String LOCAL_IP = "127.0.0.1";
    public static final String LOCALHOST = "localhost";
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
            btnUtils.addButtonTwa(WEB_GAME_URL, mainParams, R.id.button3);
            btnUtils.addButtonWebView(WEB_VIEW_URL, mainParams, R.id.button5);
            btnUtils.addButtonWebView(hostUtils.getStaticHost(LOCAL_IP), mainParams, R.id.button6);
        }
        {
            Map<String, String> b = new LinkedHashMap<>();
            b.put("wh", webSocketHost);
            b.put("sh", host);
            b.put("mode", "server");
            btnUtils.addButtonBrowser(host, b, R.id.button1);
            btnUtils.addButtonTwa(host, b, R.id.button4, host);
        }
        {
            Map<String, String> b = new LinkedHashMap<>();
            b.put("wh", hostUtils.getSocketHost(LOCAL_IP));
            b.put("sh", host);
            b.put("mode", "server");
            btnUtils.addButtonWebView(hostUtils.getStaticHost(LOCALHOST), b, R.id.button7);
            btnUtils.addButtonWebView(hostUtils.getStaticHost(LOCAL_IP), b, R.id.button8);
            btnUtils.addButtonWebView(WEB_VIEW_URL, b, R.id.button9);
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
