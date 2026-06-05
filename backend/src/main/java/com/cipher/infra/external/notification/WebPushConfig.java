package com.cipher.infra.external.notification;

import java.security.GeneralSecurityException;
import java.security.Security;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebPushConfig {

    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    @Bean
    public PushService pushService(
            @Value("${vapid.public.key}") String vapidPublicKey,
            @Value("${vapid.private.key}") String vapidPrivateKey,
            @Value("${vapid.subject}") String vapidSubject
    ) throws GeneralSecurityException {
        return new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
    }
}
