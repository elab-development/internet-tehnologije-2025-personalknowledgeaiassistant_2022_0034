import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../components/Navbar";
import "@testing-library/jest-dom";

// Mock jwt-decode
vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

import { jwtDecode } from "jwt-decode";

// Mock react-router-dom sa jednim navigate mockom
const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    NavLink: ({ children }) => <div>{children}</div>,
    useNavigate: () => navigateMock,
  };
});

describe("Navbar component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders basic links", () => {
    render(<Navbar />);
    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
    expect(screen.getByText("Chat")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("renders Users link for ADMIN role", () => {
    localStorage.setItem("token", "admin-token");
    jwtDecode.mockReturnValue({ role: "ADMIN" });

    render(<Navbar />);
    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  it("does not render Users link for non-admin role", () => {
    localStorage.setItem("token", "user-token");
    jwtDecode.mockReturnValue({ role: "USER" });

    render(<Navbar />);
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
  });

  it("handles logout correctly", () => {
    localStorage.setItem("token", "user-token");

    render(<Navbar />);
    fireEvent.click(screen.getByText("Logout"));

    expect(localStorage.getItem("token")).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith("/", { replace: true });
  });

  it("handles invalid token without crashing", () => {
    localStorage.setItem("token", "invalid-token");
    jwtDecode.mockImplementation(() => { throw new Error("Invalid"); });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Navbar />);

    expect(screen.getByText("Chat")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
