import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginForma from "../components/LoginForma";
import "@testing-library/jest-dom";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

describe("LoginForma component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    global.fetch?.mockRestore?.();
  });

  it("renders login form correctly", () => {
    render(<LoginForma isRegistering={false} setIsRegistering={vi.fn()} />);
    
    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
  });

  it("renders registration form correctly", () => {
    render(<LoginForma isRegistering={true} setIsRegistering={vi.fn()} />);
    
    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter first name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter last name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  it("shows validation errors for empty login form", async () => {
    render(<LoginForma isRegistering={false} setIsRegistering={vi.fn()} />);
    
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    expect(await screen.findByText("Username is required")).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
  });

  it("shows validation errors for registration form", async () => {
    render(<LoginForma isRegistering={true} setIsRegistering={vi.fn()} />);
    
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByText("First name is required")).toBeInTheDocument();
    expect(await screen.findByText("Last name is required")).toBeInTheDocument();
    expect(await screen.findByText("Username is required")).toBeInTheDocument();
    expect(await screen.findByText("Password is required")).toBeInTheDocument();
    expect(await screen.findByText("Please confirm your password")).toBeInTheDocument();
  });

  it("shows server error if login fails", async () => {
    // Mock fetch to simulate server error
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ success: false, message: "Invalid credentials" }),
      })
    );

    render(<LoginForma isRegistering={false} setIsRegistering={vi.fn()} />);
    
    fireEvent.change(screen.getByPlaceholderText("Enter username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter password"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    const serverError = await screen.findByText("Invalid credentials");
    expect(serverError).toBeInTheDocument();
  });

  it("submits login form successfully and stores token", async () => {
    const fakeToken = "abc123";
    const fakeUser = { username: "testuser", role: "USER" };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { token: fakeToken, user: fakeUser } }),
      })
    );

    render(<LoginForma isRegistering={false} setIsRegistering={vi.fn()} />);
    
    fireEvent.change(screen.getByPlaceholderText("Enter username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter password"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe(fakeToken);
    });
  });

  it("submits registration form successfully and toggles form", async () => {
    const setIsRegisteringMock = vi.fn();

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { token: "abc", user: {} } }),
      })
    );

    render(<LoginForma isRegistering={true} setIsRegistering={setIsRegisteringMock} />);
    
    fireEvent.change(screen.getByPlaceholderText("Enter username"), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter password"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm password"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter first name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter last name"), {
      target: { value: "Doe" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(setIsRegisteringMock).toHaveBeenCalledWith(false);
    });
  });
});
