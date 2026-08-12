# CLAUDE.md - Second Brain Processing Rules

## Claude Desktop + Local REST API + MCP Configuration

### Processing Pipeline
1. **Capture**: Claude receives input → stores to `01_Inbox`
2. **Process**: Local REST API transforms raw input → categorizes
3. **Organize**: MCP routes to appropriate folder (`02_Projects`, `03_Areas`, etc.)
4. **Store**: Permanent storage in designated vault folder

### Processing Rules

#### Inbox Zero Protocol
- All new inputs go to `01_Inbox` first
- Process Inbox daily (morning review)
- Each item must have one of: 
  - **Do** - immediate action < 2 minutes
  - **Delegate** - assign to someone else
  - **Defer** - schedule for later (move to project/area)
  - **Delete** - discard if no longer relevant
  - **Defer to System** - let automation handle it

#### Daily Review (Morning)
```
1. Review 01_Inbox entries from yesterday
2. Process each item using the 4 D's
3. Move deferred items to appropriate folders
4. Check 02_Projects for weekly review
5. Review 03_Areas for monthly maintenance
6. Add new resources to 04_Resources
7. Archive completed items to 05_Archive
```

#### Weekly Review (Every Monday)
- Review all 02_Projects
- Update 03_Areas status
- Process accumulated Inbox items
- Archive completed work to 05_Archive
- Set goals for the upcoming week

#### Monthly Review
- Deep review of all 03_Areas
- Prune 04_Resources (remove outdated)
- Long-term project planning
- Skill development tracking

### MCP (Model Context Protocol) Integration

#### Local REST API Endpoints
```
POST /api/claude/process  - Process incoming note
GET  /api/claude/status     - Check API status
GET  /api/claude/folders    - List vault folders
POST /api/claude/move       - Move note between folders
```

#### Claude Prompt Integration
When Claude encounters a note, it should:
1. Identify the intent (project, area, resource, archive)
2. Extract key entities (dates, names, topics)
3. Route to appropriate folder
4. Update metadata (tags, priorities, dates)

### iCloud Sync (Optional)
- Enable iCloud Drive sync for the `Second Brain` vault
- Ensure consistent access across Mac/iPad/iPhone
- Note: Obsidian's iCloud integration requires same Apple ID
- Sync frequency: Instant (via iCloud Drive)
