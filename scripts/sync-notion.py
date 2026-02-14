"""Sync NOTION_DOCUMENTATION.md content to Notion pages."""

import json
import os
import time
import urllib.request
import urllib.error

API_KEY = os.environ.get("NOTION_API_KEY", "")
NOTION_VERSION = "2022-06-28"
PARENT_PAGE_ID = "30550724-f619-800f-ba53-fc80d46cd530"

# Sub-page IDs from the parent page
PAGES = {
    "1. Overview & Vision": "30650724-f619-8149-9620-f8a9de1d46c1",
    "2. Flagship: Boardroom Under Pressure": "30650724-f619-8128-95e6-daa0e93d1f4a",
    "3. AI Agent System": "30650724-f619-8141-9388-e577ef927961",
    "4. Tech Stack & Architecture": "30650724-f619-8180-ad97-dce8342dbdc1",
    "5. Database & API Design": "30650724-f619-8163-b8f3-eb10c750aa42",
    "6. Revenue Model & Business": "30650724-f619-81ab-811d-d89a6e88334d",
    "7. Deployment & Infrastructure": "30650724-f619-812c-9edd-cd56164fba2d",
    "8. Roadmap & Current Status": "30650724-f619-8199-92d2-cb07ae06a5ec",
    "9. Investor Narrative": "30650724-f619-8125-ad71-e51dab0e8469",
}

# Map NOTION_DOCUMENTATION.md sections to sub-pages
SECTION_MAP = {
    "1. Overview & Vision": ["## 1. Overview", "## 2. Vision & Phases", "## 3. Platform vs Game Engine Architecture"],
    "2. Flagship: Boardroom Under Pressure": ["## 4. Flagship: Boardroom Under Pressure", "## 5. Scoring System"],
    "3. AI Agent System": ["## 6. AI System"],
    "4. Tech Stack & Architecture": ["## 9. Tech Stack", "## 12. Application Structure"],
    "5. Database & API Design": ["## 10. Database Schema", "## 11. API Design"],
    "6. Revenue Model & Business": ["## 7. Revenue Model", "## 8. Customer Segments"],
    "7. Deployment & Infrastructure": ["## 13. Infrastructure & Deployment"],
    "8. Roadmap & Current Status": ["## 16. Roadmap", "## 18. Current Build Status", "## 15. Content Studio Model", "## 14. User Flows"],
    "9. Investor Narrative": ["## 17. Investor Narrative", "## 19. Documentation Index", "## 20. Key Accounts & Services"],
}


def notion_request(method, path, body=None):
    """Make a Notion API request."""
    url = f"https://api.notion.com/v1/{path}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"  ERROR {e.code}: {error_body[:200]}")
        return None


def get_children(block_id):
    """Get all children of a block."""
    all_results = []
    start_cursor = None
    while True:
        path = f"blocks/{block_id}/children?page_size=100"
        if start_cursor:
            path += f"&start_cursor={start_cursor}"
        result = notion_request("GET", path)
        if not result:
            break
        all_results.extend(result.get("results", []))
        if not result.get("has_more"):
            break
        start_cursor = result.get("next_cursor")
    return all_results


def delete_children(block_id):
    """Delete all children of a block."""
    children = get_children(block_id)
    for child in children:
        notion_request("DELETE", f"blocks/{child['id']}")
        time.sleep(0.35)  # rate limit
    return len(children)


def text_block(text, bold=False):
    """Create a rich text element."""
    return {
        "type": "text",
        "text": {"content": text},
        "annotations": {"bold": bold, "italic": False, "strikethrough": False, "underline": False, "code": False, "color": "default"},
    }


def parse_markdown_to_blocks(md_text):
    """Convert markdown text to Notion blocks (simplified)."""
    blocks = []
    lines = md_text.split("\n")
    i = 0

    while i < len(lines):
        line = lines[i]

        # Skip empty lines
        if not line.strip():
            i += 1
            continue

        # Heading 2
        if line.startswith("## "):
            blocks.append({
                "object": "block",
                "type": "heading_2",
                "heading_2": {"rich_text": [text_block(line[3:].strip())]}
            })
            i += 1
            continue

        # Heading 3
        if line.startswith("### "):
            blocks.append({
                "object": "block",
                "type": "heading_3",
                "heading_3": {"rich_text": [text_block(line[4:].strip())]}
            })
            i += 1
            continue

        # Code block
        if line.strip().startswith("```"):
            lang = line.strip()[3:].strip() or "plain text"
            if lang not in ("javascript", "typescript", "python", "json", "sql", "yaml", "html", "css", "bash", "shell", "plain text"):
                lang = "plain text"
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            i += 1  # skip closing ```
            code_text = "\n".join(code_lines)
            if len(code_text) > 1900:
                code_text = code_text[:1900] + "\n..."
            blocks.append({
                "object": "block",
                "type": "code",
                "code": {
                    "rich_text": [text_block(code_text)],
                    "language": lang
                }
            })
            continue

        # Table
        if line.strip().startswith("|") and i + 1 < len(lines) and lines[i + 1].strip().startswith("|"):
            table_rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                row_line = lines[i].strip()
                # Skip separator rows
                if all(c in "|-: " for c in row_line):
                    i += 1
                    continue
                cells = [c.strip() for c in row_line.split("|")[1:-1]]
                table_rows.append(cells)
                i += 1

            if table_rows:
                num_cols = max(len(r) for r in table_rows)
                notion_rows = []
                for ri, row in enumerate(table_rows):
                    # Pad row to num_cols
                    while len(row) < num_cols:
                        row.append("")
                    notion_rows.append({
                        "type": "table_row",
                        "table_row": {
                            "cells": [[text_block(cell, bold=(ri == 0))] for cell in row[:num_cols]]
                        }
                    })
                blocks.append({
                    "object": "block",
                    "type": "table",
                    "table": {
                        "table_width": num_cols,
                        "has_column_header": True,
                        "has_row_header": False,
                        "children": notion_rows
                    }
                })
            continue

        # Bullet list
        if line.strip().startswith("- ") or line.strip().startswith("* "):
            bullet_text = line.strip()[2:]
            # Handle bold prefix like **text**
            if bullet_text.startswith("**") and "**" in bullet_text[2:]:
                end = bullet_text.index("**", 2)
                bold_part = bullet_text[2:end]
                rest = bullet_text[end+2:]
                rich_text = [text_block(bold_part, bold=True)]
                if rest:
                    rich_text.append(text_block(rest))
            else:
                rich_text = [text_block(bullet_text)]
            blocks.append({
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {"rich_text": rich_text}
            })
            i += 1
            continue

        # Numbered list
        if len(line.strip()) > 2 and line.strip()[0].isdigit() and line.strip()[1] in ".)" :
            num_text = line.strip()
            # Find the text after "1. " or "1) "
            dot_pos = num_text.find(". ", 0, 4)
            paren_pos = num_text.find(") ", 0, 4)
            pos = dot_pos if dot_pos >= 0 else paren_pos
            if pos >= 0:
                item_text = num_text[pos + 2:]
            else:
                item_text = num_text
            blocks.append({
                "object": "block",
                "type": "numbered_list_item",
                "numbered_list_item": {"rich_text": [text_block(item_text)]}
            })
            i += 1
            continue

        # Divider
        if line.strip() == "---":
            blocks.append({"object": "block", "type": "divider", "divider": {}})
            i += 1
            continue

        # Blockquote
        if line.strip().startswith("> "):
            quote_text = line.strip()[2:]
            blocks.append({
                "object": "block",
                "type": "quote",
                "quote": {"rich_text": [text_block(quote_text)]}
            })
            i += 1
            continue

        # Regular paragraph - collect consecutive non-special lines
        para_lines = [line.strip()]
        i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].startswith("#") and not lines[i].strip().startswith("|") and not lines[i].strip().startswith("```") and not lines[i].strip().startswith("- ") and not lines[i].strip().startswith("* ") and not lines[i].strip() == "---" and not lines[i].strip().startswith("> "):
            # Check for numbered list
            if len(lines[i].strip()) > 2 and lines[i].strip()[0].isdigit() and lines[i].strip()[1] in ".)" :
                break
            para_lines.append(lines[i].strip())
            i += 1

        para_text = " ".join(para_lines)
        if len(para_text) > 1900:
            para_text = para_text[:1900] + "..."

        # Handle bold markers in paragraph
        if "**" in para_text:
            rich_text = []
            parts = para_text.split("**")
            for pi, part in enumerate(parts):
                if part:
                    rich_text.append(text_block(part, bold=(pi % 2 == 1)))
            if not rich_text:
                rich_text = [text_block(para_text)]
        else:
            rich_text = [text_block(para_text)]

        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {"rich_text": rich_text}
        })

    return blocks


def extract_sections(md_content):
    """Extract sections from NOTION_DOCUMENTATION.md by ## headers."""
    sections = {}
    current_key = None
    current_lines = []

    for line in md_content.split("\n"):
        if line.startswith("## "):
            if current_key:
                sections[current_key] = "\n".join(current_lines)
            current_key = line.strip()
            current_lines = []
        elif current_key:
            current_lines.append(line)

    if current_key:
        sections[current_key] = "\n".join(current_lines)

    return sections


def append_blocks(page_id, blocks):
    """Append blocks to a page, in batches of 100."""
    for start in range(0, len(blocks), 100):
        batch = blocks[start:start + 100]
        result = notion_request("PATCH", f"blocks/{page_id}/children", {"children": batch})
        if result:
            print(f"    Appended {len(batch)} blocks")
        else:
            print(f"    FAILED to append blocks {start}-{start+len(batch)}")
        time.sleep(0.5)


def main():
    # Read the documentation
    with open("NOTION_DOCUMENTATION.md", "r", encoding="utf-8") as f:
        content = f.read()

    sections = extract_sections(content)
    print(f"Found {len(sections)} sections in NOTION_DOCUMENTATION.md")

    # Update parent page callout
    print("\n[1/10] Updating parent page callout...")
    result = notion_request("PATCH", f"blocks/30650724-f619-81b7-9494-f726991d9d9b", {
        "callout": {
            "rich_text": [text_block(
                "Decision-Intelligence Simulation Platform \u2014 The Netflix of Training Simulations\n"
                "Founder: Julius Joaquin | Repository: github.com/Merchously/Simvado | Live: simvado.com\n"
                "Status: Phase 1 \u2014 Foundation (In Progress) | Last Updated: February 13, 2026"
            )]
        }
    })
    print("  OK" if result else "  FAILED")
    time.sleep(0.5)

    # Update each sub-page
    for idx, (page_title, page_id) in enumerate(PAGES.items(), 2):
        print(f"\n[{idx}/10] Updating '{page_title}'...")

        # Get section keys for this page
        section_keys = SECTION_MAP.get(page_title, [])

        # Combine all relevant sections
        combined_md = ""
        for key in section_keys:
            if key in sections:
                combined_md += f"\n{key}\n{sections[key]}\n"
            else:
                print(f"  WARNING: Section '{key}' not found")

        if not combined_md.strip():
            print("  No content found, skipping")
            continue

        # Delete existing children
        deleted = delete_children(page_id)
        print(f"  Deleted {deleted} existing blocks")
        time.sleep(0.5)

        # Parse markdown to Notion blocks
        blocks = parse_markdown_to_blocks(combined_md.strip())
        print(f"  Parsed {len(blocks)} blocks from markdown")

        # Append new blocks
        append_blocks(page_id, blocks)

    print("\n=== Done! All Notion pages updated. ===")


if __name__ == "__main__":
    main()
