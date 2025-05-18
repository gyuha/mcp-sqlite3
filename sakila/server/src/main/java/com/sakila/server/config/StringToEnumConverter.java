package com.sakila.server.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * SQLite는 열거형 타입을 직접 지원하지 않으므로 문자열로 변환하는 컨버터
 */
@Converter
public class StringToEnumConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return attribute;
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return dbData;
    }
}
