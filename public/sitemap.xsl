<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">

<html>
<head>
  <title>XML Sitemap</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #f9fafb;
      color: #111827;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 8px;
    }
    p.desc {
      margin: 0 0 20px;
      color: #4b5563;
      font-size: 14px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      background: white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #111827;
      color: white;
    }
    tr:nth-child(even) {
      background: #f3f4f6;
    }
    a {
      color: #2563eb;
      text-decoration: none;
      word-break: break-all;
    }
    a:hover {
      text-decoration: underline;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      background: #dbeafe;
      color: #1e40af;
    }
    .badge.section {
      background: #dcfce7;
      color: #166534;
    }
    .badge.page {
      background: #fef3c7;
      color: #92400e;
    }
  </style>
</head>

<body>

<h1>Sitemap</h1>

<table>
  <tr>
    <th>URL</th>
    <th>Last Modified</th>
  </tr>

  <xsl:for-each select="//*[local-name()='sitemap']">
    <tr>
      <td>
        <a href="{*[local-name()='loc']}">
          <xsl:value-of select="*[local-name()='loc']"/>
        </a>
      </td>
      <td>
        <xsl:variable name="lastmod" select="*[local-name()='lastmod']"/>
        <xsl:choose>
          <xsl:when test="contains($lastmod, 'T')">
            <xsl:value-of select="translate($lastmod, 'T', ' ')"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$lastmod"/>
          </xsl:otherwise>
        </xsl:choose>
      </td>
    </tr>
  </xsl:for-each>

  <xsl:for-each select="//*[local-name()='url']">
    <tr>
      <td>
        <a href="{*[local-name()='loc']}">
          <xsl:value-of select="*[local-name()='loc']"/>
        </a>
      </td>
      <td>
        <xsl:variable name="lastmod" select="*[local-name()='lastmod']"/>
        <xsl:choose>
          <xsl:when test="contains($lastmod, 'T')">
            <xsl:value-of select="translate($lastmod, 'T', ' ')"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$lastmod"/>
          </xsl:otherwise>
        </xsl:choose>
      </td>
    </tr>
  </xsl:for-each>

</table>

</body>
</html>

</xsl:template>
</xsl:stylesheet>
