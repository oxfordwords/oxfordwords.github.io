<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:template match="/">
        <html>
            <body>
                <p>
                    <xsl:value-of select="/word/english"/>
                </p>
                <p>
                    <xsl:value-of select="/word/polish"/>
                </p>
                <p>
                    <xsl:value-of select="/word/example"/>
                </p>
                <p>
                    <xsl:value-of select="/word/related"/>
                </p>

            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
