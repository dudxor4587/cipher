package com.cipher.common.exception;

/** 레이트리밋 초과. GlobalExceptionHandler 에서 429로 변환. */
public class RateLimitExceededException extends RuntimeException {

    public RateLimitExceededException(String message) {
        super(message);
    }
}
