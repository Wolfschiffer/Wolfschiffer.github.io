import os
import asyncio
import edge_tts

# ============================================
# CONFIGURAÇÕES
# ============================================

VOZ = "en-US-JennyNeural"
PASTA_AUDIO = r"C:\Users\Marcus\Desktop\Stick-Numbers\audio"

# ============================================
# LISTA DOS QUE JÁ TEMOS (para não repetir)
# ============================================

ja_temos = set([
    # 1-20
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
    
    # Tens
    "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety", "one hundred",
    
    # 21-99
    "twenty-one", "twenty-two", "twenty-three", "twenty-four", "twenty-five",
    "twenty-six", "twenty-seven", "twenty-eight", "twenty-nine",
    "thirty-one", "thirty-two", "thirty-three", "thirty-four", "thirty-five",
    "thirty-six", "thirty-seven", "thirty-eight", "thirty-nine",
    "forty-one", "forty-two", "forty-three", "forty-four", "forty-five",
    "forty-six", "forty-seven", "forty-eight", "forty-nine",
    "fifty-one", "fifty-two", "fifty-three", "fifty-four", "fifty-five",
    "fifty-six", "fifty-seven", "fifty-eight", "fifty-nine",
    "sixty-one", "sixty-two", "sixty-three", "sixty-four", "sixty-five",
    "sixty-six", "sixty-seven", "sixty-eight", "sixty-nine",
    "seventy-one", "seventy-two", "seventy-three", "seventy-four", "seventy-five",
    "seventy-six", "seventy-seven", "seventy-eight", "seventy-nine",
    "eighty-one", "eighty-two", "eighty-three", "eighty-four", "eighty-five",
    "eighty-six", "eighty-seven", "eighty-eight", "eighty-nine",
    "ninety-one", "ninety-two", "ninety-three", "ninety-four", "ninety-five",
    "ninety-six", "ninety-seven", "ninety-eight", "ninety-nine",
    
    # Hundreds (redondos)
    "one hundred", "two hundred", "three hundred", "four hundred", "five hundred",
    "six hundred", "seven hundred", "eight hundred", "nine hundred", "one thousand",
])

# ============================================
# NÚMEROS DE 1 A 19 (especiais)
# ============================================

numeros_especiais = [
    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
    "sixteen", "seventeen", "eighteen", "nineteen"
]

# ============================================
# DEZENAS
# ============================================

dezenas = [
    "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
]

# ============================================
# GERAR NÚMEROS CORRETOS
# ============================================

def gerar_numeros_validos():
    numeros = []
    
    # 101-999
    for centena in range(1, 10):
        centena_texto = f"{numeros_especiais[centena-1]} hundred"
        
        # 100, 200, 300...
        numeros.append(centena_texto)
        
        # 101-109, 201-209...
        for unidade in range(1, 10):
            texto = f"{centena_texto} {numeros_especiais[unidade-1]}"
            numeros.append(texto)
        
        # 110-119
        for especial in range(10, 20):
            texto = f"{centena_texto} {numeros_especiais[especial-1]}"
            numeros.append(texto)
        
        # 120-199 (exceto os já incluídos)
        for d in range(0, len(dezenas)):
            dezena_texto = dezenas[d]
            
            # 120, 130, 140...
            numeros.append(f"{centena_texto} {dezena_texto}")
            
            # 121-129, 131-139...
            for unidade in range(1, 10):
                texto = f"{centena_texto} {dezena_texto}-{numeros_especiais[unidade-1]}"
                numeros.append(texto)
    
    # 1001-9999
    for milhar in range(1, 10):
        milhar_texto = f"{numeros_especiais[milhar-1]} thousand"
        
        # 1000, 2000...
        numeros.append(milhar_texto)
        
        # 1001-1009
        for unidade in range(1, 10):
            texto = f"{milhar_texto} {numeros_especiais[unidade-1]}"
            numeros.append(texto)
        
        # 1010-1019
        for especial in range(10, 20):
            texto = f"{milhar_texto} {numeros_especiais[especial-1]}"
            numeros.append(texto)
        
        # 1020-1099
        for d in range(0, len(dezenas)):
            dezena_texto = dezenas[d]
            numeros.append(f"{milhar_texto} {dezena_texto}")
            
            for unidade in range(1, 10):
                texto = f"{milhar_texto} {dezena_texto}-{numeros_especiais[unidade-1]}"
                numeros.append(texto)
        
        # Com centenas
        for centena in range(1, 10):
            centena_texto = f"{numeros_especiais[centena-1]} hundred"
            numeros.append(f"{milhar_texto} {centena_texto}")
            
            # 1100-1199, 1200-1299...
            for unidade in range(1, 10):
                texto = f"{milhar_texto} {centena_texto} {numeros_especiais[unidade-1]}"
                numeros.append(texto)
            
            for especial in range(10, 20):
                texto = f"{milhar_texto} {centena_texto} {numeros_especiais[especial-1]}"
                numeros.append(texto)
            
            for d in range(0, len(dezenas)):
                dezena_texto = dezenas[d]
                numeros.append(f"{milhar_texto} {centena_texto} {dezena_texto}")
                
                for unidade in range(1, 10):
                    texto = f"{milhar_texto} {centena_texto} {dezena_texto}-{numeros_especiais[unidade-1]}"
                    numeros.append(texto)
    
    return list(dict.fromkeys(numeros))  # Remove duplicados

# ============================================
# FUNÇÃO PARA GERAR ÁUDIO
# ============================================

async def gerar_audio(texto, arquivo):
    try:
        communicate = edge_tts.Communicate(texto, VOZ)
        await communicate.save(arquivo)
        return True
    except Exception as e:
        print(f"    ❌ Erro: {e}")
        return False

# ============================================
# EXECUÇÃO PRINCIPAL
# ============================================

async def main():
    os.makedirs(PASTA_AUDIO, exist_ok=True)
    
    print("=" * 70)
    print("🎤 GERANDO ÁUDIOS CORRETOS COM VOZ JENNY")
    print("=" * 70)
    print(f"Voz: {VOZ}")
    print(f"Pasta: {PASTA_AUDIO}")
    print("=" * 70)
    
    print("\n📊 Gerando lista de números válidos...")
    todos_numeros = gerar_numeros_validos()
    
    # Filtrar os que já temos
    faltantes = [n for n in todos_numeros if n not in ja_temos]
    total = len(faltantes)
    
    print(f"✅ Total de áudios a gerar: {total}")
    print("=" * 70)
    
    if total == 0:
        print("🎉 Nenhum áudio faltante! Tudo já está gerado!")
        return
    
    print("\n⚠️  Isso vai demorar! Pode levar de 30 a 50 minutos.")
    print("⚠️  Deixe o computador ligado e não feche a janela.")
    print("=" * 70)
    
    input("\nPressione ENTER para começar...")
    
    for i, palavra in enumerate(faltantes, 1):
        nome_arquivo = palavra.replace(" ", "_").replace("-", "_")
        arquivo = os.path.join(PASTA_AUDIO, f"{nome_arquivo}.mp3")
        
        print(f"[{i}/{total}] 🎤 Gerando: {palavra}")
        if await gerar_audio(palavra, arquivo):
            print(f"    ✅ Salvo: {nome_arquivo}.mp3")
        else:
            print(f"    ⚠️ Falhou: {palavra}")
        
        await asyncio.sleep(0.3)
    
    print("\n" + "=" * 70)
    print("✅ PRONTO! TODOS OS ÁUDIOS FORAM GERADOS!")
    print("=" * 70)

asyncio.run(main())