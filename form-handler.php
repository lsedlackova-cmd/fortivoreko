<?php

mb_internal_encoding("UTF-8");

$SITE_NAME  = "FORTIVO REKO";
$SITE_URL   = "https://fortivoreko.cz";
$TO_EMAIL   = "info@fortivoreko.cz";       
$FROM_EMAIL = "info@fortivoreko.cz";     
$LOGO_URL   = $SITE_URL . "/img/logo.png"; 
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  http_response_code(405);
  echo "Method Not Allowed";
  exit;
}

$hp = trim($_POST["hp"] ?? "");
$hp2 = trim($_POST["_honey"] ?? "");
if ($hp !== "" || $hp2 !== "") {
  header("Location: /dekuji.html");
  exit;
}

$name    = trim($_POST["name"] ?? "");
$email   = trim($_POST["email"] ?? "");
$phone   = trim($_POST["phone"] ?? "");
$place   = trim($_POST["place"] ?? "");
$message = trim($_POST["message"] ?? "");
$consent = isset($_POST["consent"]);
$copy    = isset($_POST["copy"]);

$errors = [];
if (mb_strlen($name) < 2)                            $errors[] = "Jméno je povinné.";
if (!filter_var($email, FILTER_VALIDATE_EMAIL))      $errors[] = "E-mail není platný.";
if ($place === "")                                   $errors[] = "Místo realizace je povinné.";
if ($message === "")                                 $errors[] = "Zpráva je povinná.";
if (!$consent)                                       $errors[] = "Bez souhlasu nelze odeslat.";

if ($errors) {
  http_response_code(400);
  echo "Formulář nebyl správně vyplněn.";
  exit;
}

$subject = "Poptávka z webu – {$name}" . ($place ? " ({$place})" : "");

$styleOuter = "font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;background:#f3f4f6;padding:24px";
$frame      = "border-collapse:collapse;width:100%;max-width:640px;background:#ffffff;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden";
$headCell   = "padding:16px;background:#0f172a;color:#00d0f0;font-weight:700";
$wrapCell   = "padding:20px";
$th         = "text-align:left;padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;vertical-align:top;width:180px";
$td         = "padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#111827";
$muted      = "color:#6b7280;font-size:12px;margin-top:12px";
$logo       = $LOGO_URL ? "<img src='{$LOGO_URL}' alt='{$SITE_NAME}' height='36' style='vertical-align:middle'>" : $SITE_NAME;

$h = fn($s) => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");

$bodyHtml = "
<div style='{$styleOuter}'>
  <table role='presentation' style=\"{$frame}\">
    <tr><td style=\"{$headCell}\">{$logo}</td></tr>
    <tr><td style=\"{$wrapCell}\">
      <h2 style='margin:0 0 10px 0;font-size:18px;color:#111827'>Nová poptávka z webu</h2>
      <table role='presentation' style='width:100%;border-collapse:collapse;margin-top:6px'>
        <tr><th style=\"{$th}\">Jméno</th>            <td style=\"{$td}\">{$h($name)}</td></tr>
        <tr><th style=\"{$th}\">E-mail</th>           <td style=\"{$td}\">{$h($email)}</td></tr>"
        . ($phone ? "<tr><th style=\"{$th}\">Telefon</th><td style=\"{$td}\">{$h($phone)}</td></tr>" : "") .
       "<tr><th style=\"{$th}\">Místo realizace</th>  <td style=\"{$td}\">{$h($place)}</td></tr>
        <tr><th style=\"{$th}\">Zpráva</th>           <td style=\"{$td};white-space:pre-line\">".nl2br($h($message))."</td></tr>
      </table>
      <p style=\"{$muted}\">Odesláno: ".date("d.m.Y H:i")." z <a href='{$SITE_URL}'>{$SITE_URL}</a></p>
    </td></tr>
  </table>
</div>";

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: {$SITE_NAME} <{$FROM_EMAIL}>\r\n";
$headers .= "Reply-To: ".mb_encode_mimeheader($name)." <{$email}>\r\n";
$headers .= "X-Mailer: PHP/".phpversion()."\r\n";

$okMain = @mail($TO_EMAIL, "=?UTF-8?B?".base64_encode($subject)."?=", $bodyHtml, $headers);

if ($okMain && $copy && filter_var($email, FILTER_VALIDATE_EMAIL)) {
  $copySubject = "Kopie vaší zprávy – {$SITE_NAME}";
  $copyBody = "
  <div style='{$styleOuter}'>
    <table role='presentation' style=\"{$frame}\">
      <tr><td style=\"{$headCell}\">{$logo}</td></tr>
      <tr><td style=\"{$wrapCell}\">
        <h2 style='margin:0 0 10px 0;font-size:18px;color:#111827'>Děkujeme za zprávu</h2>
        <p style='margin:0 0 12px 0;color:#111827'>
          Děkujeme, že jste nás kontaktovali prostřednictvím našeho webu
          <a href='{$SITE_URL}'>{$SITE_URL}</a>.<br>
          Toto je kopie vaší zprávy. Ozveme se vám co nejdříve.
        </p>
        <table role='presentation' style='width:100%;border-collapse:collapse;margin-top:6px'>
          <tr><th style=\"{$th}\">Jméno</th>            <td style=\"{$td}\">{$h($name)}</td></tr>
          <tr><th style=\"{$th}\">E-mail</th>           <td style=\"{$td}\">{$h($email)}</td></tr>"
          . ($phone ? "<tr><th style=\"{$th}\">Telefon</th><td style=\"{$td}\">{$h($phone)}</td></tr>" : "") .
         "<tr><th style=\"{$th}\">Místo realizace</th>  <td style=\"{$td}\">{$h($place)}</td></tr>
          <tr><th style=\"{$th}\">Zpráva</th>           <td style=\"{$td};white-space:pre-line\">".nl2br($h($message))."</td></tr>
        </table>
        <p style=\"{$muted}\">Pokud jste zprávu neodeslali vy, ignorujte tento e-mail.</p>
      </td></tr>
    </table>
  </div>";

  $copyHeaders  = "MIME-Version: 1.0\r\n";
  $copyHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
  $copyHeaders .= "From: {$SITE_NAME} <{$FROM_EMAIL}>\r\n";
  $copyHeaders .= "Reply-To: {$SITE_NAME} <{$TO_EMAIL}>\r\n";
  $copyHeaders .= "X-Mailer: PHP/".phpversion()."\r\n";

  @mail($email, "=?UTF-8?B?".base64_encode($copySubject)."?=", $copyBody, $copyHeaders);
}

if ($okMain) {
  header("Location: /dekuji.html");
  exit;
} else {
  http_response_code(500);
  echo "Omlouváme se, e-mail se nepodařilo odeslat. Zkuste to prosím později.";
  exit;
}
