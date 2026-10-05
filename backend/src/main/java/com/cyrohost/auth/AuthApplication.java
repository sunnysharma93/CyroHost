package com.cyrohost.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(
        scanBasePackages = {"com.cyrohost.auth", "com.cyrohost.console"},
        exclude = UserDetailsServiceAutoConfiguration.class
)
@ConfigurationPropertiesScan
@EntityScan(basePackages = {"com.cyrohost.auth", "com.cyrohost.console"})
@EnableJpaRepositories(basePackages = {"com.cyrohost.auth", "com.cyrohost.console"})
public class AuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
    }
}
