package com.scb.tripsystem.dto;

public class SelectionRequest {

    private String method; // "RANDOM" or "FIFO"

    public SelectionRequest() {}

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
}