# from mcp.server.fastmcp import FastMCP


# mcp = FastMCP("Spearfishing-Internal-Tools")

# @mcp.tool()
# def query_dives(fish_type: str) -> str:
#     conn = psycopg2.connect("host=db dbname=Spear user=tsoor") 
#     cur = conn.cursor()
#     cur.execute(f"SELECT * FROM dives WHERE fish_seen = %s", (fish_type,))
#     result = cur.fetchall()
#     return str(result)

# if __name__ == "__main__":
#     mcp.run()