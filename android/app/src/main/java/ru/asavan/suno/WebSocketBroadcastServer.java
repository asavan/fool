package ru.asavan.suno;

import android.content.Context;
import android.util.Log;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import fi.iki.elonen.NanoHTTPD;
import fi.iki.elonen.NanoWSD;

public class WebSocketBroadcastServer extends NanoWSD {

    private final List<WebSocket> list;

    private final Context context;
    private final String folderToServe;
    private static final String DEFAULT_STATIC_FOLDER = "www";

    public WebSocketBroadcastServer(Context context, int port, boolean secure, String folderToServe) {
        super(port);
        list = new ArrayList<>();
        this.context = context;
        this.folderToServe = folderToServe;
        if (secure) {
            SslHelper.addSslSupport(context, this);
        }
    }

    @Override
    protected WebSocket openWebSocket(IHTTPSession handshake) {
        return new DumbWebSocket(handshake, this);
    }

    @Override
    public void stop() {
        try {
            disconectAll();
        } catch (Exception ex) {
            // ignore
        }
        super.stop();
    }

    void addUser(WebSocket user) {
        list.add(user);
    }

    void removeUser(WebSocket user) {
        list.remove(user);
    }

    public void broadcast(WebSocket sender, WebSocketFrame message) {
        try {
            message.setUnmasked();
            for (WebSocket ws : list) {
                if (ws != sender) {
                    ws.sendFrame(message);
                }
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void disconectAll() {
        for (WebSocket ws : list) {
            try {
                ws.close(WebSocketFrame.CloseCode.NormalClosure, "exit", false);
            } catch (Exception e) {
                // ignore
            }
        }
    }

    public WebSocketBroadcastServer(Context context, int port, boolean secure) {
        this(context, port, secure, DEFAULT_STATIC_FOLDER);
    }

    // override here
    public String onRequest(String file) {
        return file;
    }

    @Override
    public Response serve(String uri, Method method, Map<String, String> headers, Map<String,
            String> params, Map<String, String> files) {
        if (method != Method.GET) {
            return notFound();
        }
        String file = uri;
        if ("/".equals(file)) {
            file = "index.html";
        }

        if (file.startsWith("/")) {
            file = file.substring(1);
        }
        if (file.startsWith(".")) {
            file = file.substring(1);
        }

        file = onRequest(file);
        String fileWithFolder = folderToServe + "/" + file;
        try {
            InputStream is = context.getResources().getAssets().open(fileWithFolder);
            return newChunkedResponse(Response.Status.OK, getMimeTypeForFile(file), is);
        } catch (IOException e) {
            Log.e("STATIC_SERVER_TAG", "AndroidStaticAssetsServer", e);
        }
        return notFound();
    }

    private static Response notFound() {
        return newFixedLengthResponse(Response.Status.NOT_FOUND, NanoHTTPD.MIME_PLAINTEXT, "Not Found");
    }
}
