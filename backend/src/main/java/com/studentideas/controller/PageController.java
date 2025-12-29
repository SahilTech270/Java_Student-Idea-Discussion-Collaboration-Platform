package com.studentideas.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/admin-dashboard")
    public String adminDashboard() {
        return "admin-dashboard";
    }

    @GetMapping("/idea-details")
    public String ideaDetails() {
        return "idea-details";
    }

    @GetMapping("/post-idea")
    public String postIdea() {
        return "post-idea";
    }

    @GetMapping("/profile")
    public String profile() {
        return "profile";
    }

    @GetMapping("/team-dashboard")
    public String teamDashboard() {
        return "team-dashboard";
    }

    @GetMapping("/edit-idea")
    public String editIdea() {
        return "edit-idea";
    }
}
