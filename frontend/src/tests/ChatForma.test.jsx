import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ChatForma from "../components/ChatForma.jsx";
import axios from "axios";

vi.mock("axios");

const mockUser = { data: { data: { role: "USER" } } };
const mockChats = [{ id: "chat1", title: "Chat 1" }, { id: "chat2", title: "Chat 2" }];
const mockFiles = { data: [] };

beforeEach(() => {
  localStorage.setItem("token", "fake-token");
  
  axios.get = vi.fn().mockImplementation((url) => {
    if (url.includes("/user/me")) return Promise.resolve(mockUser);
    if (url.includes("/api/chat")) return Promise.resolve({ data: mockChats });
    if (url.includes("/api/document")) return Promise.resolve(mockFiles);
    return Promise.resolve({ data: {} });
  });

  axios.post = vi.fn().mockResolvedValue({ data: { id: "newChat", title: "New Chat" } });
  axios.delete = vi.fn().mockResolvedValue({});

  vi.spyOn(window, "confirm").mockImplementation(() => true);
  vi.spyOn(window, "prompt").mockImplementation(() => "New Chat");
});

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  window.confirm.mockRestore();
  window.prompt.mockRestore();
});

const renderWithRouter = (ui) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("ChatForma Component", () => {
  test("renders loading state initially", async () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter(<ChatForma />); 
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders navbar and chats after loading", async () => {
    renderWithRouter(<ChatForma />); 

    expect(await screen.findByText("Chat 1")).toBeInTheDocument();
    expect(screen.getByText("Chat 2")).toBeInTheDocument();
  });

  test("sends a message", async () => {
    renderWithRouter(<ChatForma />); 
    
    await screen.findByText("AI Chat");

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByRole("button", { name: /send/i });

    axios.post.mockResolvedValueOnce({
      data: { data: { answer: "Bot response", sources: [] } }
    });

    fireEvent.change(input, { target: { value: "Hello bot" } });
    fireEvent.click(sendButton);

    expect(await screen.findByText("Hello bot")).toBeInTheDocument();
    expect(await screen.findByText("Bot response")).toBeInTheDocument();
  });

  test("handles new chat creation", async () => {
    renderWithRouter(<ChatForma />); 
    
    const newChatButton = await screen.findByText("+ New Chat");
    fireEvent.click(newChatButton);

    expect(window.prompt).toHaveBeenCalled();
    expect(await screen.findByText("New Chat")).toBeInTheDocument();
  });

  test("handles chat deletion", async () => {
    renderWithRouter(<ChatForma />); 
    
    const chat1 = await screen.findByText("Chat 1");
    const listItem = chat1.closest('li');
    
    const deleteButton = within(listItem).getByTitle("Delete chat");
    
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(screen.queryByText("Chat 1")).not.toBeInTheDocument();
    });
  });

test("handles file upload", async () => {
    const { container } = renderWithRouter(<ChatForma />);

    await screen.findByText("AI Chat");
    const file = new File(["dummy content"], "test.pdf", { type: "application/pdf" });
    const fileInput = container.querySelector('input[type="file"]');

    axios.post.mockResolvedValueOnce({ data: { id: "file1" } });

    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText("test.pdf")).toBeInTheDocument();
    });
  });
});